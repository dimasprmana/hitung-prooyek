<?php

declare(strict_types=1);

final class XlsxHelper
{
    private const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
    private const MAX_ROWS = 1000;

    /**
     * Parse raw rows from an uploaded .xlsx file.
     *
     * @param string $filePath
     * @return array<int, array<int, string>> 1-indexed row number => array of column values
     * @throws InvalidArgumentException|RuntimeException
     */
    public static function read(string $filePath): array
    {
        if (!file_exists($filePath)) {
            throw new InvalidArgumentException('File tidak ditemukan.');
        }

        $fileSize = filesize($filePath);
        if ($fileSize === false || $fileSize === 0) {
            throw new InvalidArgumentException('File kosong atau tidak dapat dibaca.');
        }

        if ($fileSize > self::MAX_FILE_SIZE) {
            throw new InvalidArgumentException('Ukuran file melebihi batas maksimum 5 MB.');
        }

        $zip = new ZipArchive();
        $openResult = $zip->open($filePath);
        if ($openResult !== true) {
            throw new RuntimeException('Format file tidak didukung atau file rusak. Harap unggah file Excel (.xlsx) yang valid.');
        }

        // 1. Read shared strings table if present
        $sharedStrings = [];
        $sharedStringsXml = $zip->getFromName('xl/sharedStrings.xml');
        if ($sharedStringsXml !== false) {
            $xml = @simplexml_load_string($sharedStringsXml);
            if ($xml !== false) {
                foreach ($xml->si as $si) {
                    if (isset($si->t)) {
                        $sharedStrings[] = (string) $si->t;
                    } elseif (isset($si->r)) {
                        $text = '';
                        foreach ($si->r as $r) {
                            $text .= (string) $r->t;
                        }
                        $sharedStrings[] = $text;
                    } else {
                        $sharedStrings[] = '';
                    }
                }
            }
        }

        // 2. Locate worksheet (sheet1.xml or first available sheet)
        $sheetXml = $zip->getFromName('xl/worksheets/sheet1.xml');
        if ($sheetXml === false) {
            for ($i = 0; $i < $zip->numFiles; $i++) {
                $name = $zip->getNameIndex($i);
                if (preg_match('#^xl/worksheets/sheet\d+\.xml$#i', $name)) {
                    $sheetXml = $zip->getFromName($name);
                    break;
                }
            }
        }

        if ($sheetXml === false) {
            $zip->close();
            throw new RuntimeException('Lembar kerja (sheet) tidak ditemukan dalam file Excel.');
        }

        $xml = @simplexml_load_string($sheetXml);
        $zip->close();

        if ($xml === false || !isset($xml->sheetData)) {
            throw new RuntimeException('Struktur lembar kerja Excel tidak dapat dibaca.');
        }

        $rows = [];
        $rowCount = 0;

        foreach ($xml->sheetData->row as $rowNode) {
            $rowCount++;
            if ($rowCount > self::MAX_ROWS) {
                throw new RuntimeException('Jumlah baris melebihi batas maksimum ' . self::MAX_ROWS . ' baris.');
            }

            $rowIndex = (int) ($rowNode['r'] ?? $rowCount);
            $rowData = [];

            foreach ($rowNode->c as $cell) {
                $cellRef = (string) $cell['r'];
                $colLetters = preg_replace('/[0-9]/', '', $cellRef);
                $colIndex = self::colLetterToIndex($colLetters);

                $type = (string) ($cell['t'] ?? '');
                $val = '';

                if ($type === 's') {
                    $idx = (int) $cell->v;
                    $val = $sharedStrings[$idx] ?? '';
                } elseif ($type === 'inlineStr' && isset($cell->is->t)) {
                    $val = (string) $cell->is->t;
                } elseif (isset($cell->v)) {
                    $val = (string) $cell->v;
                }

                // Strip leading formula prefixes for security
                $val = self::sanitizeCellValue(trim((string) $val));
                $rowData[$colIndex] = $val;
            }

            if (!empty($rowData)) {
                $maxCol = max(array_keys($rowData));
                $normalizedRow = [];
                for ($c = 0; $c <= $maxCol; $c++) {
                    $normalizedRow[$c] = $rowData[$c] ?? '';
                }
                $rows[$rowIndex] = $normalizedRow;
            }
        }

        return $rows;
    }

    /**
     * Map raw Excel rows to material structures, validate each row, and detect duplicates.
     *
     * @param array<int, array<int, string>> $rawRows
     * @param array<string, int> $existingMaterials Map of lowercase name => material ID
     * @return array{
     *   summary: array{totalRows: int, validCount: int, invalidCount: int, duplicateCount: int},
     *   rows: array<int, array{rowNumber: int, name: string, category: string, unit: string, price: float, status: string, isValid: bool, isDuplicate: bool, errors: array<string>}>
     * }
     */
    public static function processAndValidate(array $rawRows, array $existingMaterials): array
    {
        if (empty($rawRows)) {
            throw new InvalidArgumentException('File Excel tidak berisi data.');
        }

        // 1. Identify header row (first row with data)
        $headerRowIndex = null;
        $headers = [];
        foreach ($rawRows as $rIdx => $row) {
            $nonEmpty = array_filter($row, fn ($val) => trim((string) $val) !== '');
            if (!empty($nonEmpty)) {
                $headerRowIndex = $rIdx;
                $headers = $row;
                break;
            }
        }

        if ($headerRowIndex === null) {
            throw new InvalidArgumentException('File Excel kosong atau tidak memiliki baris header.');
        }

        // Map column index to field
        $colMap = [];
        foreach ($headers as $colIdx => $headerVal) {
            $normalizedHeader = mb_strtolower(preg_replace('/[^a-zA-Z0-9]/', '', (string) $headerVal));
            if (in_array($normalizedHeader, ['namamaterial', 'nama', 'name', 'material'], true)) {
                $colMap['name'] = $colIdx;
            } elseif (in_array($normalizedHeader, ['kategori', 'category'], true)) {
                $colMap['category'] = $colIdx;
            } elseif (in_array($normalizedHeader, ['satuan', 'unit'], true)) {
                $colMap['unit'] = $colIdx;
            } elseif (in_array($normalizedHeader, ['harga', 'price', 'hargasatuan'], true)) {
                $colMap['price'] = $colIdx;
            } elseif (in_array($normalizedHeader, ['status'], true)) {
                $colMap['status'] = $colIdx;
            }
        }

        // Required headers validation
        $missingHeaders = [];
        foreach (['name' => 'Nama Material', 'category' => 'Kategori', 'unit' => 'Satuan / Unit', 'price' => 'Harga'] as $key => $label) {
            if (!isset($colMap[$key])) {
                $missingHeaders[] = $label;
            }
        }

        if (!empty($missingHeaders)) {
            throw new InvalidArgumentException(
                'Header kolom tidak lengkap. Kolom berikut tidak ditemukan: ' . implode(', ', $missingHeaders) . '.'
            );
        }

        $processedRows = [];
        $validCount = 0;
        $invalidCount = 0;
        $duplicateCount = 0;

        // Track names seen in this file to detect within-file duplicates
        $seenFileNames = [];

        foreach ($rawRows as $rIdx => $row) {
            // Skip the header row
            if ($rIdx <= $headerRowIndex) {
                continue;
            }

            // Check if entire row is empty
            $nonEmpty = array_filter($row, fn ($val) => trim((string) $val) !== '');
            if (empty($nonEmpty)) {
                continue; // Skip blank rows safely
            }

            $rawName = trim((string) ($row[$colMap['name']] ?? ''));
            $rawCategory = trim((string) ($row[$colMap['category']] ?? ''));
            $rawUnit = trim((string) ($row[$colMap['unit']] ?? ''));
            $rawPrice = trim((string) ($row[$colMap['price']] ?? ''));
            $rawStatus = isset($colMap['status']) ? trim((string) ($row[$colMap['status']] ?? '')) : 'Aktif';

            $errors = [];

            // 1. Validate Name
            if ($rawName === '') {
                $errors[] = 'Nama material tidak boleh kosong.';
            } elseif (mb_strlen($rawName) > 255) {
                $errors[] = 'Nama material terlalu panjang (maksimum 255 karakter).';
            }

            // 2. Validate Category
            if ($rawCategory === '') {
                $errors[] = 'Kategori tidak boleh kosong.';
            }

            // 3. Validate Unit
            if ($rawUnit === '') {
                $errors[] = 'Satuan/unit tidak boleh kosong.';
            }

            // 4. Validate Price
            $cleanedPrice = self::parsePrice($rawPrice);
            if ($cleanedPrice === null) {
                $errors[] = 'Harga harus berupa angka yang valid dan tidak boleh kosong.';
            } elseif ($cleanedPrice < 0) {
                $errors[] = 'Harga tidak boleh kurang dari 0.';
            }

            // 5. Validate Status
            $status = 'Aktif';
            if ($rawStatus !== '') {
                $lowerStatus = mb_strtolower($rawStatus);
                if (in_array($lowerStatus, ['aktif', 'active', '1', 'true'], true)) {
                    $status = 'Aktif';
                } elseif (in_array($lowerStatus, ['nonaktif', 'non-aktif', 'inactive', '0', 'false'], true)) {
                    $status = 'Nonaktif';
                } else {
                    $errors[] = 'Status tidak dikenal (gunakan "Aktif" atau "Nonaktif").';
                }
            }

            // 6. Check duplicates
            $isDuplicate = false;
            $normalizedName = mb_strtolower($rawName);
            if ($rawName !== '') {
                if (isset($existingMaterials[$normalizedName])) {
                    $isDuplicate = true;
                    $errors[] = 'Material dengan nama ini sudah ada di database.';
                } elseif (isset($seenFileNames[$normalizedName])) {
                    $isDuplicate = true;
                    $errors[] = 'Material dengan nama ini duplikat dengan baris ' . $seenFileNames[$normalizedName] . ' dalam file ini.';
                } else {
                    $seenFileNames[$normalizedName] = $rIdx;
                }
            }

            $isValid = empty($errors);
            if ($isValid) {
                $validCount++;
            } else {
                $invalidCount++;
            }

            if ($isDuplicate) {
                $duplicateCount++;
            }

            $processedRows[] = [
                'rowNumber' => $rIdx,
                'name' => $rawName,
                'category' => $rawCategory,
                'unit' => $rawUnit,
                'price' => $cleanedPrice ?? 0,
                'status' => $status,
                'isValid' => $isValid,
                'isDuplicate' => $isDuplicate,
                'errors' => $errors,
            ];
        }

        return [
            'summary' => [
                'totalRows' => count($processedRows),
                'validCount' => $validCount,
                'invalidCount' => $invalidCount,
                'duplicateCount' => $duplicateCount,
            ],
            'rows' => $processedRows,
        ];
    }

    /**
     * Parse various price representations into a float number.
     */
    private static function parsePrice(string $priceStr): ?float
    {
        if ($priceStr === '') {
            return null;
        }

        // If it's already purely numeric
        if (is_numeric($priceStr)) {
            return (float) $priceStr;
        }

        // Remove currency symbols, whitespace, "Rp", commas, dots
        $str = preg_replace('/[^\d.,-]/i', '', $priceStr);
        if ($str === '' || $str === null) {
            return null;
        }

        // Handle Indonesian thousand separator e.g. "65.000" or "65.000,00"
        if (preg_match('/^(\d{1,3}(?:\.\d{3})+)(?:,(\d+))?$/', $str, $matches)) {
            $num = str_replace('.', '', $matches[1]);
            if (!empty($matches[2])) {
                $num .= '.' . $matches[2];
            }
            return (float) $num;
        }

        // Replace comma with dot for standard decimal
        $str = str_replace(',', '.', $str);
        if (is_numeric($str)) {
            return (float) $str;
        }

        return null;
    }

    /**
     * Generate official .xlsx template binary data.
     */
    public static function generateTemplate(): string
    {
        $tempFile = tempnam(sys_get_temp_dir(), 'tpl_');
        $zip = new ZipArchive();
        if ($zip->open($tempFile, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            throw new RuntimeException('Gagal membuat file template sementara.');
        }

        $zip->addFromString('[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>');

        $zip->addFromString('_rels/.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>');

        $zip->addFromString('xl/_rels/workbook.xml.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>');

        $zip->addFromString('xl/workbook.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Material" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>');

        $zip->addFromString('xl/styles.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="2">
    <font><sz val="11"/><name val="Calibri"/></font>
    <font><b/><sz val="11"/><name val="Calibri"/></font>
  </fonts>
  <fills count="1"><fill><patternFill patternType="none"/></fill></fills>
  <borders count="1"><border><left/><right/><top/><bottom/></border></borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="2">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0"/>
  </cellXfs>
</styleSheet>');

        $sheetXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>
    <row r="1">
      <c r="A1" s="1" t="inlineStr"><is><t>nama_material</t></is></c>
      <c r="B1" s="1" t="inlineStr"><is><t>kategori</t></is></c>
      <c r="C1" s="1" t="inlineStr"><is><t>satuan</t></is></c>
      <c r="D1" s="1" t="inlineStr"><is><t>harga</t></is></c>
      <c r="E1" s="1" t="inlineStr"><is><t>status</t></is></c>
    </row>
    <row r="2">
      <c r="A2" t="inlineStr"><is><t>Bata Ringan (Hebel)</t></is></c>
      <c r="B2" t="inlineStr"><is><t>Dinding</t></is></c>
      <c r="C2" t="inlineStr"><is><t>m3</t></is></c>
      <c r="D2"><v>650000</v></c>
      <c r="E2" t="inlineStr"><is><t>Aktif</t></is></c>
    </row>
    <row r="3">
      <c r="A3" t="inlineStr"><is><t>Semen Instan Mortar</t></is></c>
      <c r="B3" t="inlineStr"><is><t>Semen</t></is></c>
      <c r="C3" t="inlineStr"><is><t>sak</t></is></c>
      <c r="D3"><v>85000</v></c>
      <c r="E3" t="inlineStr"><is><t>Aktif</t></is></c>
    </row>
  </sheetData>
</worksheet>';
        $zip->addFromString('xl/worksheets/sheet1.xml', $sheetXml);
        $zip->close();

        $content = (string) file_get_contents($tempFile);
        @unlink($tempFile);
        return $content;
    }

    private static function colLetterToIndex(string $letters): int
    {
        $letters = strtoupper(trim($letters));
        $len = strlen($letters);
        $idx = 0;
        for ($i = 0; $i < $len; $i++) {
            $idx = $idx * 26 + (ord($letters[$i]) - ord('A') + 1);
        }
        return max(0, $idx - 1);
    }

    private static function sanitizeCellValue(string $value): string
    {
        // If value starts with formula characters, disarm it
        if ($value !== '' && in_array($value[0], ['=', '+', '-', '@'], true)) {
            // Strip leading symbol if it's '=' or '@'
            if (in_array($value[0], ['=', '@'], true)) {
                $value = ltrim($value, '=@');
            }
        }
        return $value;
    }
}

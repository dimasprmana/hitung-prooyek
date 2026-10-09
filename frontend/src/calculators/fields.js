const doorDefault = [{ id: 'door-1', width: '0.9', height: '2.1', quantity: '1' }]
const windowDefault = [{ id: 'window-1', width: '1.2', height: '1.2', quantity: '1' }]

const field = (name, label, config = {}) => ({
  name,
  label,
  type: 'number',
  min: '0',
  step: '0.01',
  ...config,
})

const select = (name, label, options, config = {}) => field(name, label, { type: 'select', options, ...config })
const radio = (name, label, options, config = {}) => field(name, label, { type: 'radio', options, ...config })
const checkbox = (name, label, config = {}) => field(name, label, { type: 'checkbox', defaultValue: false, ...config })

const showWhen = (name, values) => ({ field: name, equals: Array.isArray(values) ? values : [values] })

export const calculatorFields = {
  dinding: [
    {
      title: 'Data Pekerjaan',
      fields: [
        radio('wallMethod', 'Metode Perhitungan', ['Satu Bidang Dinding', 'Keliling Ruangan'], { defaultValue: 'Satu Bidang Dinding' }),
        field('length', 'Panjang Dinding', { unit: 'm', defaultValue: '3', showWhen: showWhen('wallMethod', 'Satu Bidang Dinding') }),
        field('height', 'Tinggi Dinding', { unit: 'm', defaultValue: '3', showWhen: showWhen('wallMethod', 'Satu Bidang Dinding') }),
        field('roomLength', 'Panjang Ruangan', { unit: 'm', defaultValue: '4', showWhen: showWhen('wallMethod', 'Keliling Ruangan') }),
        field('roomWidth', 'Lebar Ruangan', { unit: 'm', defaultValue: '3', showWhen: showWhen('wallMethod', 'Keliling Ruangan') }),
        field('wallHeight', 'Tinggi Dinding', { unit: 'm', defaultValue: '3', showWhen: showWhen('wallMethod', 'Keliling Ruangan') }),
      ],
    },
    {
      title: 'Spesifikasi Dinding',
      fields: [
        select('wallType', 'Jenis Material', ['Bata Merah', 'Bata Ringan AAC 7.5 cm', 'Bata Ringan AAC 10 cm', 'Batako'], { defaultValue: 'Bata Merah' }),
      ],
    },
    {
      title: 'Bukaan',
      description: 'Tambahkan pintu atau jendela yang mengurangi luas bersih dinding.',
      fields: [
        { type: 'dynamic-openings', name: 'doors', label: 'Pintu', addLabel: '+ Tambah Pintu', defaultValue: doorDefault },
        { type: 'dynamic-openings', name: 'windows', label: 'Jendela', addLabel: '+ Tambah Jendela', defaultValue: windowDefault },
      ],
    },
    {
      title: 'Finishing',
      fields: [
        checkbox('includePlaster', 'Hitung Plester'),
        checkbox('includeAcian', 'Hitung Acian'),
        select('finishSides', 'Sisi Finishing', ['1 sisi', '2 sisi'], { defaultValue: '2 sisi', showWhen: showWhen('includePlaster', true) }),
        field('plasterThickness', 'Tebal Plester', { unit: 'mm', defaultValue: '15', step: '1', showWhen: showWhen('includePlaster', true) }),
      ],
    },
    {
      title: 'Pengaturan Lanjutan',
      advanced: true,
      fields: [field('waste', 'Waste Material', { unit: '%', defaultValue: '5', step: '1', max: '30' })],
    },
  ],
  beton: [
    {
      title: 'Data Pekerjaan',
      fields: [
        select('concreteType', 'Jenis Pengecoran', ['Plat / Dak', 'Balok', 'Kolom Persegi', 'Kolom Bulat', 'Sloof', 'Volume Manual'], { defaultValue: 'Plat / Dak' }),
        field('length', 'Panjang', { unit: 'm', defaultValue: '4', showWhen: showWhen('concreteType', 'Plat / Dak') }),
        field('width', 'Lebar', { unit: 'm', defaultValue: '3', showWhen: showWhen('concreteType', 'Plat / Dak') }),
        field('thickness', 'Tebal', { unit: 'm', defaultValue: '0.12', showWhen: showWhen('concreteType', 'Plat / Dak') }),
        field('count', 'Jumlah', { defaultValue: '1', step: '1', showWhen: showWhen('concreteType', 'Plat / Dak') }),
        field('totalLength', 'Panjang Total', { unit: 'm', defaultValue: '6', showWhen: showWhen('concreteType', ['Balok', 'Sloof']) }),
        field('beamWidth', 'Lebar', { unit: 'm', defaultValue: '0.2', showWhen: showWhen('concreteType', ['Balok', 'Sloof']) }),
        field('beamHeight', 'Tinggi', { unit: 'm', defaultValue: '0.3', showWhen: showWhen('concreteType', ['Balok', 'Sloof']) }),
        field('beamCount', 'Jumlah', { defaultValue: '1', step: '1', showWhen: showWhen('concreteType', 'Balok') }),
        field('columnWidth', 'Lebar Kolom', { unit: 'm', defaultValue: '0.25', showWhen: showWhen('concreteType', 'Kolom Persegi') }),
        field('columnDepth', 'Tebal Kolom', { unit: 'm', defaultValue: '0.25', showWhen: showWhen('concreteType', 'Kolom Persegi') }),
        field('columnHeight', 'Tinggi Kolom', { unit: 'm', defaultValue: '3', showWhen: showWhen('concreteType', ['Kolom Persegi', 'Kolom Bulat']) }),
        field('columnCount', 'Jumlah Kolom', { defaultValue: '4', step: '1', showWhen: showWhen('concreteType', ['Kolom Persegi', 'Kolom Bulat']) }),
        field('diameter', 'Diameter', { unit: 'm', defaultValue: '0.3', showWhen: showWhen('concreteType', 'Kolom Bulat') }),
        field('manualVolume', 'Volume Beton', { unit: 'm3', defaultValue: '1', showWhen: showWhen('concreteType', 'Volume Manual') }),
      ],
    },
    {
      title: 'Spesifikasi Beton',
      fields: [
        select('concreteGrade', 'Mutu Beton', ['K-175', 'K-200', 'K-225', 'K-250', 'K-300', 'Campuran Manual'], { defaultValue: 'K-225' }),
        field('cementRatio', 'Semen', { defaultValue: '1', step: '1', showWhen: showWhen('concreteGrade', 'Campuran Manual') }),
        field('sandRatio', 'Pasir', { defaultValue: '2', step: '1', showWhen: showWhen('concreteGrade', 'Campuran Manual') }),
        field('aggregateRatio', 'Split', { defaultValue: '3', step: '1', showWhen: showWhen('concreteGrade', 'Campuran Manual') }),
        select('cementBag', 'Kemasan Semen', ['40 kg', '50 kg'], { defaultValue: '50 kg' }),
      ],
    },
    { title: 'Pengaturan Lanjutan', advanced: true, fields: [field('waste', 'Waste Beton', { unit: '%', defaultValue: '5', step: '1', max: '30' })] },
  ],
  besi: [
    {
      title: 'Metode Perhitungan',
      fields: [radio('steelMode', 'Metode', ['Berdasarkan Jumlah Batang', 'Berdasarkan Total Panjang'], { defaultValue: 'Berdasarkan Jumlah Batang' })],
    },
    {
      title: 'Spesifikasi Besi',
      fields: [
        select('steelType', 'Jenis Besi', ['Besi Polos', 'Besi Ulir'], { defaultValue: 'Besi Ulir' }),
        select('diameter', 'Diameter', ['6', '8', '10', '12', '13', '16', '19', '22', '25', '29', '32'], { defaultValue: '10', unit: 'mm' }),
        field('barCount', 'Jumlah Batang', { defaultValue: '10', step: '1', showWhen: showWhen('steelMode', 'Berdasarkan Jumlah Batang') }),
        field('lengthPerBar', 'Panjang per Batang', { unit: 'm', defaultValue: '12', showWhen: showWhen('steelMode', 'Berdasarkan Jumlah Batang') }),
        field('totalSteelLength', 'Total Panjang', { unit: 'm', defaultValue: '120', showWhen: showWhen('steelMode', 'Berdasarkan Total Panjang') }),
        field('standardBarLength', 'Panjang Standar Batang', { unit: 'm', defaultValue: '12', showWhen: showWhen('steelMode', 'Berdasarkan Total Panjang') }),
      ],
    },
    { title: 'Pengaturan Lanjutan', advanced: true, fields: [field('waste', 'Waste', { unit: '%', defaultValue: '3', step: '1', max: '30' })] },
  ],
  pondasi: [
    {
      title: 'Jenis Pondasi',
      fields: [radio('foundationType', 'Jenis Pondasi', ['Pondasi Batu Kali', 'Footplat'], { defaultValue: 'Pondasi Batu Kali' })],
    },
    {
      title: 'Dimensi Pondasi',
      fields: [
        field('length', 'Panjang Total Pondasi', { unit: 'm', defaultValue: '10', showWhen: showWhen('foundationType', 'Pondasi Batu Kali') }),
        field('topWidth', 'Lebar Atas', { unit: 'm', defaultValue: '0.3', showWhen: showWhen('foundationType', 'Pondasi Batu Kali') }),
        field('bottomWidth', 'Lebar Bawah', { unit: 'm', defaultValue: '0.6', showWhen: showWhen('foundationType', 'Pondasi Batu Kali') }),
        field('height', 'Tinggi Pondasi', { unit: 'm', defaultValue: '0.7', showWhen: showWhen('foundationType', 'Pondasi Batu Kali') }),
        field('footplateCount', 'Jumlah Footplat', { defaultValue: '4', step: '1', showWhen: showWhen('foundationType', 'Footplat') }),
        field('footplateLength', 'Panjang Footplat', { unit: 'm', defaultValue: '1', showWhen: showWhen('foundationType', 'Footplat') }),
        field('footplateWidth', 'Lebar Footplat', { unit: 'm', defaultValue: '1', showWhen: showWhen('foundationType', 'Footplat') }),
        field('footplateThickness', 'Tebal Footplat', { unit: 'm', defaultValue: '0.25', showWhen: showWhen('foundationType', 'Footplat') }),
      ],
    },
    {
      title: 'Spesifikasi Material',
      fields: [
        select('mortarMix', 'Campuran Adukan', ['1 : 3', '1 : 4', '1 : 5', '1 : 6'], { defaultValue: '1 : 5', showWhen: showWhen('foundationType', 'Pondasi Batu Kali') }),
        select('cementBag', 'Kemasan Semen', ['40 kg', '50 kg'], { defaultValue: '50 kg', showWhen: showWhen('foundationType', 'Pondasi Batu Kali') }),
        checkbox('includePedestal', 'Hitung Pedestal', { showWhen: showWhen('foundationType', 'Footplat') }),
        field('pedestalLength', 'Panjang Pedestal', { unit: 'm', defaultValue: '0.25', showWhen: showWhen('includePedestal', true) }),
        field('pedestalWidth', 'Lebar Pedestal', { unit: 'm', defaultValue: '0.25', showWhen: showWhen('includePedestal', true) }),
        field('pedestalHeight', 'Tinggi Pedestal', { unit: 'm', defaultValue: '0.6', showWhen: showWhen('includePedestal', true) }),
        select('concreteGrade', 'Mutu Beton', ['K-175', 'K-200', 'K-225', 'K-250', 'K-300'], { defaultValue: 'K-225', showWhen: showWhen('foundationType', 'Footplat') }),
        checkbox('includeRebar', 'Hitung Tulangan', { showWhen: showWhen('foundationType', 'Footplat') }),
        select('rebarDiameter', 'Diameter Tulangan', ['D8', 'D10', 'D12', 'D13', 'D16'], { defaultValue: 'D10', showWhen: showWhen('includeRebar', true) }),
        field('rebarSpacing', 'Jarak Tulangan', { unit: 'mm', defaultValue: '150', step: '1', showWhen: showWhen('includeRebar', true) }),
        field('rebarLayers', 'Jumlah Lapisan', { defaultValue: '2', step: '1', showWhen: showWhen('includeRebar', true) }),
      ],
    },
    { title: 'Pengaturan Lanjutan', advanced: true, fields: [field('waste', 'Waste', { unit: '%', defaultValue: '5', step: '1', max: '30' })] },
  ],
  'baja-ringan': [
    { title: 'Model Atap', fields: [select('roofModel', 'Model Atap', ['Atap Pelana', 'Atap Limas', 'Atap Sandar'], { defaultValue: 'Atap Pelana' })] },
    {
      title: 'Dimensi Bangunan',
      fields: [
        field('length', 'Panjang Bangunan', { unit: 'm', defaultValue: '8' }),
        field('width', 'Lebar Bangunan', { unit: 'm', defaultValue: '6' }),
        field('overhang', 'Overstek', { unit: 'm', defaultValue: '0.5' }),
        field('slope', 'Kemiringan Atap', { unit: 'derajat', defaultValue: '30', step: '1' }),
      ],
    },
    {
      title: 'Rangka',
      fields: [
        field('trussSpacing', 'Jarak Kuda-kuda', { unit: 'm', defaultValue: '1.2' }),
        field('battenSpacing', 'Jarak Reng', { unit: 'm', defaultValue: '0.30' }),
        field('channelLength', 'Panjang Kanal C per Batang', { unit: 'm', defaultValue: '6' }),
        field('battenLength', 'Panjang Reng per Batang', { unit: 'm', defaultValue: '6' }),
      ],
    },
    {
      title: 'Penutup Atap',
      fields: [
        checkbox('includeRoofCover', 'Hitung Penutup Atap'),
        select('roofType', 'Jenis Penutup', ['Genteng Metal', 'Spandek', 'Genteng Beton', 'Genteng Keramik', 'Custom'], { defaultValue: 'Genteng Metal', showWhen: showWhen('includeRoofCover', true) }),
        field('coverEffectiveWidth', 'Lebar Efektif', { unit: 'm', defaultValue: '0.75', showWhen: showWhen('roofType', 'Custom') }),
        field('coverEffectiveLength', 'Panjang Efektif', { unit: 'm', defaultValue: '1.8', showWhen: showWhen('roofType', 'Custom') }),
      ],
    },
    {
      title: 'Pengaturan Lanjutan',
      advanced: true,
      fields: [
        field('waste', 'Waste Rangka', { unit: '%', defaultValue: '5', step: '1', max: '30' }),
        field('roofCoverWaste', 'Waste Penutup Atap', { unit: '%', defaultValue: '8', step: '1', max: '30' }),
      ],
    },
  ],
  tangga: [
    { title: 'Model Tangga', fields: [select('stairModel', 'Model Tangga', ['Tangga Lurus', 'Tangga L', 'Tangga U'], { defaultValue: 'Tangga Lurus' })] },
    {
      title: 'Dimensi',
      fields: [
        field('floorHeight', 'Tinggi Antar Lantai', { unit: 'm', defaultValue: '3' }),
        field('width', 'Lebar Tangga', { unit: 'm', defaultValue: '1' }),
        field('targetRiser', 'Target Tinggi Anak Tangga', { unit: 'cm', defaultValue: '17.5', step: '0.1' }),
        field('treadWidth', 'Lebar Pijakan', { unit: 'cm', defaultValue: '28', step: '0.1' }),
      ],
    },
    {
      title: 'Bordes',
      fields: [
        checkbox('includeLanding', 'Gunakan Bordes'),
        field('landingLength', 'Panjang Bordes', { unit: 'm', defaultValue: '1', showWhen: showWhen('includeLanding', true) }),
        field('landingWidth', 'Lebar Bordes', { unit: 'm', defaultValue: '1', showWhen: showWhen('includeLanding', true) }),
      ],
    },
    {
      title: 'Struktur',
      fields: [
        field('slabThickness', 'Tebal Plat Tangga', { unit: 'cm', defaultValue: '12', step: '0.1' }),
        select('concreteGrade', 'Mutu Beton', ['K-175', 'K-200', 'K-225', 'K-250', 'K-300'], { defaultValue: 'K-225' }),
      ],
    },
    { title: 'Pengaturan Lanjutan', advanced: true, fields: [field('waste', 'Waste', { unit: '%', defaultValue: '5', step: '1', max: '30' })] },
  ],
  keramik: [
    {
      title: 'Metode Input',
      fields: [
        radio('tileInputMethod', 'Metode', ['Dimensi Ruangan', 'Luas Langsung'], { defaultValue: 'Dimensi Ruangan' }),
        field('roomLength', 'Panjang Ruangan', { unit: 'm', defaultValue: '4', showWhen: showWhen('tileInputMethod', 'Dimensi Ruangan') }),
        field('roomWidth', 'Lebar Ruangan', { unit: 'm', defaultValue: '3', showWhen: showWhen('tileInputMethod', 'Dimensi Ruangan') }),
        field('area', 'Luas Area', { unit: 'm2', defaultValue: '12', showWhen: showWhen('tileInputMethod', 'Luas Langsung') }),
      ],
    },
    {
      title: 'Spesifikasi Keramik',
      fields: [
        select('tileType', 'Jenis', ['Keramik', 'Granit', 'Homogeneous Tile'], { defaultValue: 'Keramik' }),
        select('tileSize', 'Ukuran', ['20 x 20 cm', '30 x 30 cm', '40 x 40 cm', '50 x 50 cm', '60 x 60 cm', '80 x 80 cm', '100 x 100 cm', 'Custom'], { defaultValue: '60 x 60 cm' }),
        field('tileLength', 'Panjang Keramik', { unit: 'cm', defaultValue: '60', step: '0.1', showWhen: showWhen('tileSize', 'Custom') }),
        field('tileWidth', 'Lebar Keramik', { unit: 'cm', defaultValue: '60', step: '0.1', showWhen: showWhen('tileSize', 'Custom') }),
        field('piecesPerBox', 'Isi per Dus', { unit: 'pcs', defaultValue: '4', step: '1' }),
        field('boxCoverage', 'Cakupan per Dus', { unit: 'm2', defaultValue: '1.44' }),
      ],
    },
    {
      title: 'Pola dan Material Pendukung',
      fields: [
        select('installPattern', 'Pola Pemasangan', ['Lurus', 'Diagonal', 'Custom'], { defaultValue: 'Lurus' }),
        checkbox('includeAdhesive', 'Hitung Perekat'),
        field('adhesiveConsumption', 'Konsumsi Perekat', { unit: 'kg/m2', defaultValue: '4', showWhen: showWhen('includeAdhesive', true) }),
        checkbox('includeGrout', 'Hitung Nat'),
        field('groutWidth', 'Lebar Nat', { unit: 'mm', defaultValue: '3', step: '1', showWhen: showWhen('includeGrout', true) }),
      ],
    },
    { title: 'Pengaturan Lanjutan', advanced: true, fields: [field('waste', 'Waste', { unit: '%', defaultValue: '7', step: '1', max: '30' })] },
  ],
  cat: [
    {
      title: 'Metode Perhitungan',
      fields: [
        radio('paintMethod', 'Metode', ['Satu Bidang', 'Ruangan', 'Luas Langsung'], { defaultValue: 'Satu Bidang' }),
        field('length', 'Panjang Dinding', { unit: 'm', defaultValue: '4', showWhen: showWhen('paintMethod', 'Satu Bidang') }),
        field('height', 'Tinggi Dinding', { unit: 'm', defaultValue: '3', showWhen: showWhen('paintMethod', 'Satu Bidang') }),
        field('roomLength', 'Panjang Ruangan', { unit: 'm', defaultValue: '4', showWhen: showWhen('paintMethod', 'Ruangan') }),
        field('roomWidth', 'Lebar Ruangan', { unit: 'm', defaultValue: '3', showWhen: showWhen('paintMethod', 'Ruangan') }),
        field('wallHeight', 'Tinggi Dinding', { unit: 'm', defaultValue: '3', showWhen: showWhen('paintMethod', 'Ruangan') }),
        field('area', 'Luas Pengecatan', { unit: 'm2', defaultValue: '12', showWhen: showWhen('paintMethod', 'Luas Langsung') }),
      ],
    },
    {
      title: 'Bukaan',
      fields: [
        { type: 'dynamic-openings', name: 'doors', label: 'Pintu', addLabel: '+ Tambah Pintu', defaultValue: doorDefault },
        { type: 'dynamic-openings', name: 'windows', label: 'Jendela', addLabel: '+ Tambah Jendela', defaultValue: windowDefault },
      ],
    },
    {
      title: 'Spesifikasi Cat',
      fields: [
        select('paintType', 'Jenis Cat', ['Interior', 'Eksterior'], { defaultValue: 'Interior' }),
        field('coats', 'Jumlah Lapisan', { defaultValue: '2', step: '1' }),
        field('coverage', 'Daya Sebar Cat', { unit: 'm2/liter/lapis', defaultValue: '10' }),
        checkbox('usePrimer', 'Gunakan Primer / Sealer'),
        field('primerCoats', 'Jumlah Lapisan Primer', { defaultValue: '1', step: '1', showWhen: showWhen('usePrimer', true) }),
        field('primerCoverage', 'Daya Sebar Primer', { unit: 'm2/liter/lapis', defaultValue: '10', showWhen: showWhen('usePrimer', true) }),
      ],
    },
    { title: 'Pengaturan Lanjutan', advanced: true, fields: [field('waste', 'Waste Cat', { unit: '%', defaultValue: '5', step: '1', max: '30' })] },
  ],
  plafon: [
    {
      title: 'Dimensi',
      fields: [
        field('roomLength', 'Panjang Ruangan', { unit: 'm', defaultValue: '4' }),
        field('roomWidth', 'Lebar Ruangan', { unit: 'm', defaultValue: '3' }),
      ],
    },
    {
      title: 'Jenis Plafon',
      fields: [
        select('ceilingType', 'Jenis Plafon', ['Gypsum', 'GRC', 'PVC'], { defaultValue: 'Gypsum' }),
        field('boardLength', 'Panjang Papan', { unit: 'm', defaultValue: '2.4', showWhen: showWhen('ceilingType', ['Gypsum', 'GRC']) }),
        field('boardWidth', 'Lebar Papan', { unit: 'm', defaultValue: '1.2', showWhen: showWhen('ceilingType', ['Gypsum', 'GRC']) }),
        field('panelWidth', 'Lebar Panel', { unit: 'm', defaultValue: '0.20', showWhen: showWhen('ceilingType', 'PVC') }),
        field('panelLength', 'Panjang Panel', { unit: 'm', defaultValue: '4', showWhen: showWhen('ceilingType', 'PVC') }),
      ],
    },
    {
      title: 'Rangka',
      fields: [
        select('frameType', 'Jenis Rangka', ['Hollow Galvanis', 'Hollow Aluminium', 'Custom'], { defaultValue: 'Hollow Galvanis' }),
        field('mainHollowSpacing', 'Jarak Hollow Utama', { unit: 'm', defaultValue: '0.8' }),
        field('secondaryHollowSpacing', 'Jarak Hollow Pembagi', { unit: 'm', defaultValue: '0.6' }),
        field('hollowLength', 'Panjang Hollow per Batang', { unit: 'm', defaultValue: '4' }),
      ],
    },
    {
      title: 'Drop Ceiling',
      fields: [
        checkbox('hasDropCeiling', 'Ada Drop Ceiling'),
        field('dropLength', 'Panjang Drop', { unit: 'm', defaultValue: '2', showWhen: showWhen('hasDropCeiling', true) }),
        field('dropWidth', 'Lebar Drop', { unit: 'm', defaultValue: '1', showWhen: showWhen('hasDropCeiling', true) }),
        field('dropHeight', 'Tinggi Drop', { unit: 'm', defaultValue: '0.2', showWhen: showWhen('hasDropCeiling', true) }),
      ],
    },
    {
      title: 'Pengaturan Lanjutan',
      advanced: true,
      fields: [
        field('waste', 'Waste Plafon', { unit: '%', defaultValue: '5', step: '1', max: '30' }),
        field('frameWaste', 'Waste Rangka', { unit: '%', defaultValue: '5', step: '1', max: '30' }),
      ],
    },
  ],
  wallpaper: [
    {
      title: 'Metode',
      fields: [
        radio('wallpaperMethod', 'Metode', ['Satu Bidang Dinding', 'Keliling Ruangan'], { defaultValue: 'Satu Bidang Dinding' }),
        field('length', 'Panjang Dinding', { unit: 'm', defaultValue: '4', showWhen: showWhen('wallpaperMethod', 'Satu Bidang Dinding') }),
        field('height', 'Tinggi Dinding', { unit: 'm', defaultValue: '3', showWhen: showWhen('wallpaperMethod', 'Satu Bidang Dinding') }),
        field('roomLength', 'Panjang Ruangan', { unit: 'm', defaultValue: '4', showWhen: showWhen('wallpaperMethod', 'Keliling Ruangan') }),
        field('roomWidth', 'Lebar Ruangan', { unit: 'm', defaultValue: '3', showWhen: showWhen('wallpaperMethod', 'Keliling Ruangan') }),
        field('wallHeight', 'Tinggi Dinding', { unit: 'm', defaultValue: '3', showWhen: showWhen('wallpaperMethod', 'Keliling Ruangan') }),
      ],
    },
    {
      title: 'Spesifikasi Wallpaper',
      fields: [
        field('rollWidth', 'Lebar Roll', { unit: 'm', defaultValue: '0.53' }),
        field('rollLength', 'Panjang Roll', { unit: 'm', defaultValue: '10' }),
        select('motifType', 'Jenis Motif', ['Polos', 'Bermotif'], { defaultValue: 'Polos' }),
        field('patternRepeat', 'Pattern Repeat', { unit: 'cm', defaultValue: '53', step: '1', showWhen: showWhen('motifType', 'Bermotif') }),
      ],
    },
    {
      title: 'Bukaan',
      fields: [
        checkbox('trackOpenings', 'Catat Bukaan'),
        { type: 'dynamic-openings', name: 'doors', label: 'Pintu', addLabel: '+ Tambah Pintu', defaultValue: doorDefault, showWhen: showWhen('trackOpenings', true) },
        { type: 'dynamic-openings', name: 'windows', label: 'Jendela', addLabel: '+ Tambah Jendela', defaultValue: windowDefault, showWhen: showWhen('trackOpenings', true) },
      ],
    },
    { title: 'Pengaturan Lanjutan', advanced: true, fields: [field('waste', 'Waste', { unit: '%', defaultValue: '10', step: '1', max: '30' })] },
  ],
  vinyl: [
    {
      title: 'Metode Input',
      fields: [
        radio('vinylInputMethod', 'Metode', ['Dimensi Ruangan', 'Luas Langsung'], { defaultValue: 'Dimensi Ruangan' }),
        field('roomLength', 'Panjang Ruangan', { unit: 'm', defaultValue: '4', showWhen: showWhen('vinylInputMethod', 'Dimensi Ruangan') }),
        field('roomWidth', 'Lebar Ruangan', { unit: 'm', defaultValue: '3', showWhen: showWhen('vinylInputMethod', 'Dimensi Ruangan') }),
        field('area', 'Luas Area', { unit: 'm2', defaultValue: '12', showWhen: showWhen('vinylInputMethod', 'Luas Langsung') }),
      ],
    },
    {
      title: 'Produk',
      fields: [
        select('vinylType', 'Jenis Material', ['Vinyl Sticker', 'Vinyl Plank', 'SPC Click Lock'], { defaultValue: 'SPC Click Lock' }),
        select('productMethod', 'Metode Produk', ['Berdasarkan Cakupan Box', 'Berdasarkan Ukuran Plank'], { defaultValue: 'Berdasarkan Cakupan Box' }),
        field('boxCoverage', 'Cakupan per Box', { unit: 'm2', defaultValue: '2.2', showWhen: showWhen('productMethod', 'Berdasarkan Cakupan Box') }),
        field('plankLength', 'Panjang Plank', { unit: 'mm', defaultValue: '1220', step: '1', showWhen: showWhen('productMethod', 'Berdasarkan Ukuran Plank') }),
        field('plankWidth', 'Lebar Plank', { unit: 'mm', defaultValue: '180', step: '1', showWhen: showWhen('productMethod', 'Berdasarkan Ukuran Plank') }),
        field('piecesPerBox', 'Isi per Box', { unit: 'pcs', defaultValue: '10', step: '1', showWhen: showWhen('productMethod', 'Berdasarkan Ukuran Plank') }),
      ],
    },
    {
      title: 'Pola dan Material Tambahan',
      fields: [
        select('installPattern', 'Pola Pemasangan', ['Lurus', 'Diagonal', 'Custom'], { defaultValue: 'Lurus' }),
        checkbox('includeUnderlayer', 'Hitung Underlayer'),
        field('underlayerCoverage', 'Cakupan Underlayer per Roll', { unit: 'm2', defaultValue: '20', showWhen: showWhen('includeUnderlayer', true) }),
        checkbox('includeSkirting', 'Hitung Skirting'),
        field('skirtingLength', 'Panjang Skirting per Batang', { unit: 'm', defaultValue: '2.4', showWhen: showWhen('includeSkirting', true) }),
      ],
    },
    { title: 'Pengaturan Lanjutan', advanced: true, fields: [field('waste', 'Waste', { unit: '%', defaultValue: '7', step: '1', max: '30' })] },
  ],
}

function cloneDefault(value) {
  if (Array.isArray(value)) return value.map((item) => ({ ...item }))
  return value
}

function eachField(type, callback) {
  ;(calculatorFields[type] || []).forEach((section) => {
    section.fields.forEach(callback)
  })
}

export function getInitialInput(type, override = {}) {
  const input = {}

  eachField(type, (item) => {
    if (!item.name || input[item.name] !== undefined) return
    input[item.name] = override[item.name] ?? cloneDefault(item.defaultValue) ?? ''
  })

  return input
}

function num(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback
}

function openingArea(rows = []) {
  if (!Array.isArray(rows)) return 0
  return rows.reduce((sum, row) => sum + num(row.width) * num(row.height) * num(row.quantity), 0)
}

function roomWallArea(form) {
  return 2 * (num(form.roomLength) + num(form.roomWidth)) * num(form.wallHeight)
}

function tileCoverageFromSize(form) {
  if (form.tileSize !== 'Custom') return form.boxCoverage
  return (num(form.tileLength) / 100) * (num(form.tileWidth) / 100) * num(form.piecesPerBox, 1)
}

export function prepareCalculatorInput(type, form) {
  const input = { ...form }
  const openings = openingArea(form.doors) + openingArea(form.windows)

  if (type === 'dinding') {
    const isRoom = form.wallMethod === 'Keliling Ruangan'
    return {
      ...input,
      length: isRoom ? 2 * (num(form.roomLength) + num(form.roomWidth)) : form.length,
      height: isRoom ? form.wallHeight : form.height,
      openingArea: openings,
      waste: Math.min(num(form.waste), 30),
    }
  }

  if (type === 'beton') {
    if (form.concreteType === 'Balok') {
      return { ...input, length: form.totalLength, width: form.beamWidth, thickness: form.beamHeight, count: form.beamCount, waste: Math.min(num(form.waste), 30) }
    }
    if (form.concreteType === 'Sloof') {
      return { ...input, length: form.totalLength, width: form.beamWidth, thickness: form.beamHeight, count: '1', waste: Math.min(num(form.waste), 30) }
    }
    if (form.concreteType === 'Kolom Persegi') {
      return { ...input, length: form.columnWidth, width: form.columnDepth, thickness: form.columnHeight, count: form.columnCount, waste: Math.min(num(form.waste), 30) }
    }
    if (form.concreteType === 'Kolom Bulat') {
      return { ...input, length: form.diameter, width: form.diameter, thickness: form.columnHeight, count: form.columnCount, waste: Math.min(num(form.waste), 30) }
    }
    if (form.concreteType === 'Volume Manual') {
      return { ...input, length: form.manualVolume, width: '1', thickness: '1', count: '1', waste: Math.min(num(form.waste), 30) }
    }
  }

  if (type === 'besi' && form.steelMode === 'Berdasarkan Total Panjang') {
    const length = num(form.standardBarLength, 12)
    return {
      ...input,
      lengthPerBar: length,
      barCount: length > 0 ? num(form.totalSteelLength) / length : 0,
      waste: Math.min(num(form.waste), 30),
    }
  }

  if (type === 'pondasi') {
    if (form.foundationType === 'Pondasi Batu Kali') {
      return {
        ...input,
        width: (num(form.topWidth) + num(form.bottomWidth)) / 2,
        waste: Math.min(num(form.waste), 30),
      }
    }
    const pedestalVolume = form.includePedestal ? num(form.pedestalLength) * num(form.pedestalWidth) * num(form.pedestalHeight) * num(form.footplateCount, 1) : 0
    const footplateVolume = num(form.footplateLength) * num(form.footplateWidth) * num(form.footplateThickness) * num(form.footplateCount, 1)
    return { ...input, length: footplateVolume + pedestalVolume, width: '1', height: '1', waste: Math.min(num(form.waste), 30) }
  }

  if (type === 'baja-ringan') {
    return {
      ...input,
      length: num(form.length) + num(form.overhang) * 2,
      width: num(form.width) + num(form.overhang) * 2,
      waste: Math.min(num(form.waste), 30),
    }
  }

  if (type === 'keramik') {
    const area = form.tileInputMethod === 'Dimensi Ruangan' ? num(form.roomLength) * num(form.roomWidth) : form.area
    return { ...input, area, boxCoverage: tileCoverageFromSize(form), waste: Math.min(num(form.waste), 30) }
  }

  if (type === 'cat') {
    const area =
      form.paintMethod === 'Ruangan'
        ? roomWallArea(form)
        : form.paintMethod === 'Satu Bidang'
          ? num(form.length) * num(form.height)
          : num(form.area)

    return { ...input, area: Math.max(area - openings, 0), waste: Math.min(num(form.waste), 30) }
  }

  if (type === 'plafon') {
    return { ...input, area: num(form.roomLength) * num(form.roomWidth), waste: Math.min(num(form.waste), 30) }
  }

  if (type === 'tangga') {
    const targetRiser = num(form.targetRiser, 17.5)
    return {
      ...input,
      stepCount: targetRiser > 0 ? Math.ceil((num(form.floorHeight) * 100) / targetRiser) : '',
      tread: num(form.treadWidth, 28) / 100,
      waste: Math.min(num(form.waste), 30),
    }
  }

  if (type === 'wallpaper') {
    const area = form.wallpaperMethod === 'Keliling Ruangan' ? roomWallArea(form) : num(form.length) * num(form.height)
    return { ...input, area: Math.max(area - openings, 0), waste: Math.min(num(form.waste), 30) }
  }

  if (type === 'vinyl') {
    const area = form.vinylInputMethod === 'Dimensi Ruangan' ? num(form.roomLength) * num(form.roomWidth) : form.area
    return { ...input, area, waste: Math.min(num(form.waste), 30) }
  }

  return { ...input, waste: Math.min(num(form.waste), 30) }
}

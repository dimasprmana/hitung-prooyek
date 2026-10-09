import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ArrowLeft, Save } from 'lucide-react';
import AdminPageHeader from '../../components/AdminPageHeader';
import { createAdminMaterial,getAdminMaterialById,updateAdminMaterial,} from '../../services/adminApi';

import '../../styles/admin-material-form.css';

const initialForm = {
  name: '',
  category: '',
  unit: '',
  price: '',
  status: 'Aktif',
};

function AdminMaterialForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEdit = Boolean(id);

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [loadingMaterial, setLoadingMaterial] = useState(isEdit);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) {
      return;
    }

    let active = true;

    async function loadMaterial() {
      try {
        setLoadingMaterial(true);
        setError('');

        const material = await getAdminMaterialById(id);

        if (!active) {
          return;
        }

        setForm({
          name: material.name || '',
          category: material.category || '',
          unit: material.unit || '',
          price:
            material.price === null || material.price === undefined
              ? ''
              : String(material.price),
          status: material.status || 'Aktif',
        });
      } catch (requestError) {
        if (!active) {
          return;
        }

        setError(requestError.message || 'Data material gagal dimuat.');
      } finally {
        if (active) {
          setLoadingMaterial(false);
        }
      }
    }

    loadMaterial();

    return () => {
      active = false;
    };
  }, [id, isEdit]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    if (error) {
      setError('');
    }
  }

  function formatPricePreview(value) {
    const number = Number(value);

    if (value === '' || Number.isNaN(number)) {
      return 'Rp0';
    }

    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(number);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const price = Number(form.price);

    const payload = {
      name: form.name.trim(),
      category: form.category.trim(),
      unit: form.unit.trim(),
      price,
      status: form.status,
    };

    if (!payload.name || !payload.category || !payload.unit) {
      setError('Nama material, kategori, dan unit wajib diisi.');
      return;
    }

    if (form.price === '' || Number.isNaN(price) || price < 0) {
      setError('Harga material wajib diisi dan tidak boleh kurang dari 0.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      if (isEdit) {
        await updateAdminMaterial(id, payload);
      } else {
        await createAdminMaterial(payload);
      }

      navigate('/admin/materials', {
        replace: true,
        state: {
          message: isEdit
            ? 'Material berhasil diperbarui.'
            : 'Material berhasil ditambahkan.',
        },
      });
    } catch (requestError) {
      setError(requestError.message || 'Material gagal disimpan.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-page">
      <AdminPageHeader
        eyebrow="Master Data / Material"
        title={isEdit ? 'Edit Material' : 'Tambah Material'}
        description={
          isEdit
            ? 'Perbarui informasi material yang sudah tersimpan.'
            : 'Tambahkan material baru ke dalam data master HitungProyek.'
        }
        action={
          <Link className="admin-button secondary" to="/admin/materials">
            <ArrowLeft size={16} />
            Kembali
          </Link>
        }
      />

      <section className="admin-material-form-card">
        <div className="admin-material-form-header">
          <div>
            <h2>{isEdit ? 'Informasi Material' : 'Data Material'}</h2>
            <p>
              Isi informasi material dengan lengkap agar dapat digunakan dalam perhitungan.
            </p>
          </div>
          <span className="admin-form-required">* Wajib diisi</span>
        </div>

        {loadingMaterial ? (
          <div className="admin-form-loading">
            <div className="admin-loading-spinner" />
            <p>Memuat data material...</p>
          </div>
        ) : (
          <form className="admin-material-form" onSubmit={handleSubmit}>
            {error && (
              <div className="admin-form-error" role="alert">
                <strong>Data belum dapat disimpan</strong>
                <span>{error}</span>
              </div>
            )}

            <div className="admin-form-grid">
              {/* Nama */}
              <div className="admin-form-field full">
                <label htmlFor="material-name">
                  Nama Material <span>*</span>
                </label>
                <input
                  id="material-name"
                  className="admin-input"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Contoh: Semen Portland"
                  autoComplete="off"
                />
                <small>Masukkan nama material yang mudah dikenali.</small>
              </div>

              {/* Kategori */}
              <div className="admin-form-field">
                <label htmlFor="material-category">
                  Kategori <span>*</span>
                </label>
                <input
                  id="material-category"
                  className="admin-input"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  placeholder="Contoh: Struktur"
                  autoComplete="off"
                />
                <small>Contoh: Struktur, Dinding, Finishing.</small>
              </div>

              {/* Unit */}
              <div className="admin-form-field">
                <label htmlFor="material-unit">
                  Satuan / Unit <span>*</span>
                </label>
                <input
                  id="material-unit"
                  className="admin-input"
                  name="unit"
                  value={form.unit}
                  onChange={handleChange}
                  placeholder="Contoh: sak"
                  autoComplete="off"
                />
                <small>Contoh: kg, sak, m³, batang, pcs.</small>
              </div>

              {/* Harga */}
              <div className="admin-form-field">
                <label htmlFor="material-price">
                  Harga <span>*</span>
                </label>
                <div className="admin-price-input">
                  <span>Rp</span>
                  <input
                    id="material-price"
                    className="admin-input"
                    type="number"
                    name="price"
                    min="0"
                    step="1"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="65000"
                    inputMode="numeric"
                  />
                </div>
                <small className="admin-price-preview">
                  {formatPricePreview(form.price)}
                  <span> / {form.unit || 'unit'}</span>
                </small>
              </div>

              {/* Status */}
              <div className="admin-form-field">
                <label htmlFor="material-status">Status</label>
                <select
                  id="material-status"
                  className="admin-input"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Nonaktif">Nonaktif</option>
                </select>
                <small>Material aktif dapat digunakan dalam perhitungan.</small>
              </div>
            </div>

            <div className="admin-form-divider" />

            <div className="admin-material-form-footer">
              <Link className="admin-button secondary" to="/admin/materials">
                Batal
              </Link>
              <button
                className="admin-button primary"
                type="submit"
                disabled={loading}
              >
                <Save size={16} />
                {loading
                  ? 'Menyimpan...'
                  : isEdit
                  ? 'Simpan Perubahan'
                  : 'Simpan Material'}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}

export default AdminMaterialForm;
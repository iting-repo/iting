import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Plus, GripVertical, Pencil, Trash2, Search, Tag, MapPin, Cpu, Loader2, RefreshCw, Eye, EyeOff, Shield, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Badge, Input, Switch, Dialog, ConfirmDialog } from '../../../components';
import categoryService from '../../../services/categoryService';

const typeConfig = {
  SKILL: {
    label: 'Kỹ năng',
    icon: Cpu,
    color: 'bg-blue-500/10 text-blue-700',
    desc: 'Quản lý danh sách kỹ năng IT (Java, Python, React,...)',
  },
  LOCATION: {
    label: 'Địa điểm',
    icon: MapPin,
    color: 'bg-green-500/10 text-green-700',
    desc: 'Quản lý danh sách tỉnh/thành phố tuyển dụng',
  },
  INDUSTRY: {
    label: 'Ngành nghề',
    icon: Tag,
    color: 'bg-purple-500/10 text-purple-700',
    desc: 'Ngành nghề hệ thống (enum) + ngành nghề tùy chỉnh',
  },
  POSITION: {
    label: 'Vị trí',
    icon: Briefcase,
    color: 'bg-orange-500/10 text-orange-700',
    desc: 'Quản lý danh sách vị trí tuyển dụng (Frontend, Backend,...)',
  },
};

const CategoryManagement = () => {
  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState('SKILL');
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', nameEn: '', description: '' });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [summary, setSummary] = useState({ SKILL: 0, LOCATION: 0, INDUSTRY: 0, POSITION: 0 });
  const [industryEnums, setIndustryEnums] = useState([]);

  // Drag state
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);
  const [draggingId, setDraggingId] = useState(null);

  // --- Fetch summary counts ---
  const fetchSummary = useCallback(async () => {
    try {
      const data = await categoryService.getSummary();
      setSummary(data || { SKILL: 0, LOCATION: 0, INDUSTRY: 0, POSITION: 0 });
    } catch {
      // Silently ignore
    }
  }, []);

  // --- Fetch Industry enum values ---
  const fetchIndustryEnums = useCallback(async () => {
    try {
      const data = await categoryService.getIndustryEnums();
      setIndustryEnums(Array.isArray(data) ? data : []);
    } catch {
      setIndustryEnums([]);
    }
  }, []);

  // --- Fetch categories from API ---
  const fetchCategories = useCallback(async (type) => {
    setLoading(true);
    try {
      const data = await categoryService.getByType(type);
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Không thể tải danh mục');
      console.error('Fetch categories error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories(activeTab);
    fetchSummary();
  }, [activeTab, fetchCategories, fetchSummary]);

  useEffect(() => {
    // Luôn fetch industryEnums 1 lần khi mount để đếm số lượng cho đúng trên các tab
    fetchIndustryEnums();
  }, [fetchIndustryEnums]);

  const DEFAULT_TECH_OPTIONS = [
    "ReactJS", "NodeJS", "Java", "Spring Boot", "PostgreSQL",
    "MySQL", "Redis", "Docker", "TypeScript", "JavaScript",
    "HTML", "CSS", "Tailwind CSS"
  ];

  const DEFAULT_POSITION_OPTIONS = [
    "Frontend Developer", "Backend Developer", "Fullstack Developer",
    "UI/UX Designer", "QA Engineer", "DevOps Engineer",
    "Business Analyst", "Mobile Developer", "Project Manager"
  ];

  // --- Merge data for display ---
  // For INDUSTRY tab: show enum values (system) + custom categories from DB
  // For SKILL tab: show DEFAULT_TECH_OPTIONS (system) + custom categories from DB
  // For POSITION tab: show DEFAULT_POSITION_OPTIONS (system) + custom categories from DB
  const getMergedItems = () => {
    if (activeTab === 'LOCATION') return items;

    let systemItems = [];
    if (activeTab === 'INDUSTRY') {
      systemItems = industryEnums.map((e, i) => ({
        id: `enum-${e.value}`,
        name: e.name,
        nameEn: e.nameEn,
        description: null,
        active: true,
        sortOrder: i,
        isSystem: true,
        enumValue: e.value,
      }));
    } else if (activeTab === 'SKILL') {
      systemItems = DEFAULT_TECH_OPTIONS.map((name, i) => ({
        id: `sys-skill-${i}`,
        name: name,
        nameEn: name,
        description: null,
        active: true,
        sortOrder: i,
        isSystem: true,
      }));
    } else if (activeTab === 'POSITION') {
      systemItems = DEFAULT_POSITION_OPTIONS.map((name, i) => ({
        id: `sys-position-${i}`,
        name: name,
        nameEn: name,
        description: null,
        active: true,
        sortOrder: i,
        isSystem: true,
      }));
    }

    // Custom categories from DB (not system)
    const customItems = items.map((item, i) => ({
      ...item,
      isSystem: false,
      sortOrder: systemItems.length + (item.sortOrder ?? i),
    }));

    // Filter out custom items that already exist in system items
    const filteredCustomItems = customItems.filter(custom => 
      !systemItems.some(sys => sys.name.toLowerCase() === custom.name.toLowerCase())
    );

    return [...systemItems, ...filteredCustomItems];
  };

  const mergedItems = getMergedItems();

  const filtered = mergedItems
    .filter((i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      (i.nameEn && i.nameEn.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      // System items first, then by sortOrder
      if (a.isSystem && !b.isSystem) return -1;
      if (!a.isSystem && b.isSystem) return 1;
      return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
    });

  const cfg = typeConfig[activeTab];
  const Icon = cfg.icon;

  // --- Drag & Drop handlers (only for non-INDUSTRY or custom items) ---
  const handleDragStart = (index, id) => {
    const item = filtered[index];
    if (item?.isSystem) return; // Can't drag system items
    dragItem.current = index;
    setDraggingId(id);
  };

  const handleDragEnter = (index) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = async () => {
    if (dragItem.current === null || dragOverItem.current === null || dragItem.current === dragOverItem.current) {
      setDraggingId(null);
      return;
    }

    if (activeTab === 'INDUSTRY' || activeTab === 'SKILL' || activeTab === 'POSITION') {
      // Prevent drag for tabs with system items
      setDraggingId(null);
      dragItem.current = null;
      dragOverItem.current = null;
      return;
    }

    const list = Array.from(filtered);
    const [moved] = list.splice(dragItem.current, 1);
    list.splice(dragOverItem.current, 0, moved);

    const reordered = list.map((item, i) => ({ ...item, sortOrder: i }));
    setItems(reordered);
    setDraggingId(null);
    dragItem.current = null;
    dragOverItem.current = null;

    try {
      await categoryService.reorder(activeTab, reordered.map((i) => i.id));
      toast.success('Đã cập nhật thứ tự');
    } catch {
      toast.error('Không thể cập nhật thứ tự');
      fetchCategories(activeTab);
    }
  };

  // --- CRUD ---
  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', nameEn: '', description: '' });
    setDialogOpen(true);
  };

  const openEdit = (item) => {
    if (item.isSystem) return; // Can't edit system items
    setEditing(item);
    setForm({
      name: item.name || '',
      nameEn: item.nameEn || '',
      description: item.description || '',
    });
    setDialogOpen(true);
  };

  const [formErrors, setFormErrors] = useState({});

  const handleSave = async () => {
    const errors = {};
    if (!form.name.trim()) errors.name = '* Vui lòng nhập tên danh mục';
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setFormErrors({});
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        nameEn: form.nameEn?.trim() || null,
        description: form.description?.trim() || null,
      };

      if (editing) {
        await categoryService.update(editing.id, payload);
        toast.success('Đã cập nhật danh mục');
      } else {
        await categoryService.create(activeTab, payload);
        toast.success('Đã thêm danh mục mới');
      }
      setDialogOpen(false);
      fetchCategories(activeTab);
      fetchSummary();
    } catch (err) {
      const msg = err?.error || err?.message || 'Có lỗi xảy ra';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await categoryService.delete(id);
      toast.success('Đã xóa danh mục');
      fetchCategories(activeTab);
      fetchSummary();
    } catch (err) {
      const msg = err?.error || err?.message || 'Không thể xóa';
      toast.error(msg);
    }
  };

  const toggleActive = async (id) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, active: !i.active } : i)));
    try {
      await categoryService.toggleActive(id);
    } catch {
      toast.error('Không thể thay đổi trạng thái');
      fetchCategories(activeTab);
    }
  };

  const tabs = [
    { key: 'SKILL', label: 'Kỹ năng', icon: Cpu },
    { key: 'LOCATION', label: 'Địa điểm', icon: MapPin },
    { key: 'INDUSTRY', label: 'Ngành nghề', icon: Tag },
    { key: 'POSITION', label: 'Vị trí', icon: Briefcase },
  ];

  const systemCount = filtered.filter((i) => i.isSystem).length;
  const customCount = filtered.filter((i) => !i.isSystem).length;
  const activeCount = filtered.filter((i) => i.active).length;
  const inactiveCount = filtered.filter((i) => !i.active).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Quản lý Danh mục</h2>
          <p className="text-gray-500 text-sm mt-1">{cfg.desc}</p>
        </div>
        <div className="flex flex-wrap gap-2 self-start sm:self-auto shrink-0">
          <Button variant="outline" onClick={() => fetchCategories(activeTab)} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
          <Button variant="primary" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm {cfg.label}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-full sm:w-fit overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {tabs.map((tab) => {
          const TabIcon = tab.icon;
          let count = summary[tab.key] || 0;
          if (tab.key === 'INDUSTRY') {
            count += industryEnums.length;
          } else if (tab.key === 'SKILL') {
            count += DEFAULT_TECH_OPTIONS.length;
          } else if (tab.key === 'POSITION') {
            count += DEFAULT_POSITION_OPTIONS.length;
          }

          // Lấy số lượng chính xác tuyệt đối (đã lọc trùng) cho tab đang được mở
          if (tab.key === activeTab) {
            count = mergedItems.length;
          }

          return (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setSearch('');
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all shrink-0 ${
                activeTab === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <TabIcon className="h-4 w-4" />
              {tab.label}
              <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.key ? 'bg-[#3AB4E6]/10 text-[#3AB4E6]' : 'bg-gray-200/60 text-gray-400'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search + Stats bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="relative w-full sm:max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={`Tìm ${cfg.label.toLowerCase()}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 w-full"
          />
        </div>
        {!loading && filtered.length > 0 && (
          <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
            {activeTab === 'INDUSTRY' && (
              <>
                <span className="flex items-center gap-1">
                  <Shield className="h-3.5 w-3.5 text-purple-400" />
                  {systemCount} hệ thống
                </span>
                <span className="text-gray-200">|</span>
                <span className="flex items-center gap-1">
                  <Plus className="h-3.5 w-3.5 text-blue-400" />
                  {customCount} tùy chỉnh
                </span>
              </>
            )}
            {activeTab !== 'INDUSTRY' && (
              <>
                <span className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5 text-green-500" />
                  {activeCount} đang hiển thị
                </span>
                <span className="flex items-center gap-1">
                  <EyeOff className="h-3.5 w-3.5 text-gray-300" />
                  {inactiveCount} đã ẩn
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-[#3AB4E6]" />
        </div>
      )}

      {/* List */}
      {!loading && (
        <div className="space-y-2">
          {filtered.length === 0 && (
            <div className="text-center text-gray-400 py-16 bg-white rounded-2xl border border-gray-100">
              <Icon className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium">
                {search ? `Không tìm thấy "${search}"` : `Chưa có ${cfg.label.toLowerCase()} nào`}
              </p>
              <p className="text-sm mt-1">Bấm "Thêm {cfg.label}" để bắt đầu</p>
            </div>
          )}

          {/* System items separator for INDUSTRY */}
          {activeTab === 'INDUSTRY' && systemCount > 0 && !search && (
            <div className="flex items-center gap-2 py-1">
              <Shield className="h-3.5 w-3.5 text-purple-400" />
              <span className="text-xs font-semibold text-purple-500 uppercase tracking-wider">Ngành nghề hệ thống (Enum)</span>
              <div className="flex-1 border-t border-purple-100" />
            </div>
          )}

          {filtered.map((item, index) => {
            const isSystem = item.isSystem;
            const showCustomSeparator = activeTab === 'INDUSTRY' && !search &&
              index > 0 && filtered[index - 1]?.isSystem && !item.isSystem;

            return (
              <React.Fragment key={item.id}>
                {showCustomSeparator && (
                  <div className="flex items-center gap-2 py-1 mt-4">
                    <Plus className="h-3.5 w-3.5 text-blue-400" />
                    <span className="text-xs font-semibold text-blue-500 uppercase tracking-wider">Ngành nghề tùy chỉnh (Database)</span>
                    <div className="flex-1 border-t border-blue-100" />
                  </div>
                )}
                <div
                  draggable={!isSystem}
                  onDragStart={() => handleDragStart(index, item.id)}
                  onDragEnter={() => handleDragEnter(index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                  className={`flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 bg-white rounded-2xl border transition-all ${
                    draggingId === item.id
                      ? 'shadow-lg ring-2 ring-[#3AB4E6]/30 border-[#3AB4E6]/20 opacity-80 scale-[1.01]'
                      : isSystem
                        ? 'border-purple-100/60 shadow-sm bg-purple-50/20'
                        : item.active
                          ? 'border-gray-100 shadow-sm hover:shadow-md'
                          : 'border-gray-100 shadow-sm hover:shadow-md opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Drag Handle */}
                    <div className={`${isSystem ? 'text-gray-200 cursor-default' : 'cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600'} transition-colors shrink-0`}>
                      <GripVertical className="h-5 w-5" />
                    </div>

                    {/* Type Icon */}
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                      isSystem ? 'bg-purple-500/10 text-purple-600' : cfg.color
                    }`}>
                      {isSystem ? <Shield className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-800 text-sm truncate">{item.name}</h3>
                        {isSystem && (
                          <Badge className="text-[10px] bg-purple-100 text-purple-600 border-purple-200 shrink-0">Hệ thống</Badge>
                        )}
                        {!item.active && !isSystem && (
                          <Badge variant="outline" className="text-xs text-gray-400 border-gray-200 shrink-0">Ẩn</Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 truncate">
                        {item.nameEn || '—'}
                        {isSystem && item.enumValue && (
                          <span className="ml-2 text-purple-300 font-mono text-[10px]">{item.enumValue}</span>
                        )}
                        {!isSystem && item.description && (
                          <span className="ml-2 text-gray-300">• {item.description}</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Actions — only for custom items */}
                  {!isSystem && (
                    <div className="flex items-center justify-end gap-2 w-full sm:w-auto border-t sm:border-t-0 border-gray-100 pt-3 sm:pt-0 sm:border-l sm:pl-4 shrink-0">
                      <div className="flex items-center gap-1.5 mr-2">
                        <span className="text-xs text-gray-400 hidden sm:inline">
                          {item.active ? 'Hiện' : 'Ẩn'}
                        </span>
                        <Switch checked={item.active} onCheckedChange={() => toggleActive(item.id)} />
                      </div>
                      <button
                        onClick={() => openEdit(item)}
                        className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(item)}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Xóa"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editing ? `Sửa ${cfg.label}` : `Thêm ${cfg.label}`}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Tên <span className="text-red-500">*</span>
            </label>
            <Input
              value={form.name}
              onChange={(e) => {
                setForm({ ...form, name: e.target.value });
                if (formErrors.name) setFormErrors({ ...formErrors, name: null });
              }}
              placeholder={
                activeTab === 'SKILL' ? 'VD: Java, Python, React...' :
                activeTab === 'LOCATION' ? 'VD: Hà Nội, TP. Hồ Chí Minh...' :
                'VD: Fintech, EdTech, HealthTech...'
              }
              autoFocus
              className={formErrors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}
            />
            {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Tên tiếng Anh</label>
            <Input
              value={form.nameEn}
              onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
              placeholder={
                activeTab === 'SKILL' ? 'VD: Java, Python, React...' :
                activeTab === 'LOCATION' ? 'VD: Hanoi, Ho Chi Minh City...' :
                'VD: Fintech, EdTech, HealthTech...'
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Mô tả</label>
            <Input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Mô tả ngắn (tùy chọn)"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {editing ? 'Cập nhật' : 'Tạo mới'}
          </Button>
        </div>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => handleDelete(deleteTarget?.id)}
        title="Xóa danh mục"
        message={`Bạn có chắc chắn muốn xóa "${deleteTarget?.name}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa"
        type="danger"
      />
    </div>
  );
};

export default CategoryManagement;

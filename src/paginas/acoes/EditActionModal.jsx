import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";

export default function EditActionModal({ action, onSubmit, onClose }) {
  const [form, setForm] = useState(action || null);

  useEffect(() => {
    setForm(action);
  }, [action]);

  if (!form) return null;

  const handleUpdate = async () => {
    if (!form.titulo.trim()) return toast.error("Título obrigatório");
    await onSubmit(form);
    toast.success("Ação atualizada!");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-6">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>

      <div className="relative bg-white rounded-lg max-w-xl w-full shadow-xl">

        <div className="p-4 bg-blue-600 text-white flex justify-between items-center rounded-t-lg">
          <h3 className="font-bold text-lg">Editar Ação</h3>
          <button onClick={onClose}><X /></button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="text-sm">Título</label>
            <input className="w-full border rounded p-2" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
          </div>

          <div>
            <label className="text-sm">Descrição</label>
            <textarea className="w-full border rounded p-2" rows={3} value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
          </div>

          <div className="flex justify-end gap-2">
            <button className="px-4 py-2 border rounded" onClick={onClose}>Cancelar</button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handleUpdate}>Salvar</button>
          </div>
        </div>

      </div>
    </div>
  );
}

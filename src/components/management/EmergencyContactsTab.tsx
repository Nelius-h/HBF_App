import React, { useState } from 'react';
import {
  PhoneCall,
  Plus,
  Radio,
  Users,
  Shield,
  HeartPulse,
  Flame,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  Phone,
  MessageSquare,
} from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';
import { useData } from '../../context/DataContext';
import { EmergencyContact, ContactCategory } from '../../types';

export const EmergencyContactsTab: React.FC = () => {
  const { t } = useI18n();
  const {
    emergencyContacts,
    createEmergencyContact,
    updateEmergencyContact,
    deleteEmergencyContact,
  } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);

  // Form state
  const [category, setCategory] = useState<ContactCategory>('REACTION_FORCE');
  const [name, setName] = useState('');
  const [organisation, setOrganisation] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [areaSector, setAreaSector] = useState('Alle Sektore');
  const [isActive, setIsActive] = useState(true);
  const [notes, setNotes] = useState('');

  const handleOpenCreate = () => {
    setEditingContactId(null);
    setCategory('REACTION_FORCE');
    setName('');
    setOrganisation('');
    setPhone('');
    setWhatsappNumber('');
    setAreaSector('Alle Sektore');
    setIsActive(true);
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (contact: EmergencyContact) => {
    setEditingContactId(contact.id);
    setCategory(contact.category);
    setName(contact.name);
    setOrganisation(contact.organisation);
    setPhone(contact.phone);
    setWhatsappNumber(contact.whatsappNumber || '');
    setAreaSector(contact.areaSector || 'Alle Sektore');
    setIsActive(contact.isActive);
    setNotes(contact.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    if (editingContactId) {
      updateEmergencyContact(editingContactId, {
        category,
        name: name.trim(),
        organisation: organisation.trim(),
        phone: phone.trim(),
        whatsappNumber: whatsappNumber.trim() || undefined,
        areaSector: areaSector.trim(),
        isActive,
        notes: notes.trim() || undefined,
      });
    } else {
      createEmergencyContact({
        category,
        name: name.trim(),
        organisation: organisation.trim(),
        phone: phone.trim(),
        whatsappNumber: whatsappNumber.trim() || undefined,
        areaSector: areaSector.trim(),
        isActive,
        notes: notes.trim() || undefined,
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this emergency contact?')) {
      deleteEmergencyContact(id);
    }
  };

  const getCategoryIcon = (cat: ContactCategory) => {
    switch (cat) {
      case 'REACTION_FORCE':
        return <Radio className="w-4 h-4 text-red-400" />;
      case 'MANAGEMENT':
        return <Users className="w-4 h-4 text-amber-400" />;
      case 'POLICE':
        return <Shield className="w-4 h-4 text-blue-400" />;
      case 'AMBULANCE':
        return <HeartPulse className="w-4 h-4 text-emerald-400" />;
      case 'FIRE':
        return <Flame className="w-4 h-4 text-orange-400" />;
      default:
        return <PhoneCall className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-4 text-white text-xs">
      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-black text-sm text-white uppercase tracking-wide">
            {t.management.contactsHeader}
          </h3>
          <p className="text-slate-400 text-[11px]">
            {t.management.contactsDesc}
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          <span>{t.management.addContactBtn}</span>
        </button>
      </div>

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {emergencyContacts.map((contact) => (
          <div
            key={contact.id}
            className={`bg-slate-900 border rounded-2xl p-4 space-y-3 transition ${
              contact.isActive ? 'border-slate-800' : 'border-slate-800/50 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                  {getCategoryIcon(contact.category)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{contact.name}</span>
                    {!contact.isActive && (
                      <span className="bg-slate-800 text-slate-400 px-2 py-0.2 rounded text-[10px] uppercase font-bold">
                        Inactive
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 block">{contact.organisation}</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(contact)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(contact.id)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-900/60 text-slate-400 hover:text-red-300"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="space-y-1.5 bg-slate-850 p-2.5 rounded-xl border border-slate-800 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-500" />
                  <span>Phone:</span>
                </span>
                <a
                  href={`tel:${contact.phone.replace(/[^0-9+]/g, '')}`}
                  className="font-mono text-emerald-400 font-bold hover:underline"
                >
                  {contact.phone}
                </a>
              </div>

              {contact.whatsappNumber && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <MessageSquare className="w-3 h-3 text-emerald-500" />
                    <span>WhatsApp:</span>
                  </span>
                  <span className="font-mono text-emerald-300">{contact.whatsappNumber}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-slate-400">
                <span>Sector Area:</span>
                <span className="text-white font-medium">{contact.areaSector || 'District-wide'}</span>
              </div>
            </div>

            {contact.notes && (
              <p className="text-[11px] text-slate-400 italic px-1">{contact.notes}</p>
            )}
          </div>
        ))}
      </div>

      {/* Modal: Create/Edit Contact */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleSubmit}
            className="bg-slate-900 border border-amber-500/60 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl text-xs text-white"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-amber-400 text-sm">
                {editingContactId ? 'Edit Emergency Contact' : 'Add Emergency Contact'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Category:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ContactCategory)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                >
                  <option value="REACTION_FORCE">Reaction Force (Plaaswag Reaksie)</option>
                  <option value="MANAGEMENT">Management / Security Committee</option>
                  <option value="POLICE">SAPS South African Police</option>
                  <option value="AMBULANCE">Ambulance / Emergency Medical (EMS)</option>
                  <option value="FIRE">Fire Protection Association (FPA)</option>
                  <option value="OTHER">Other Responder</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Contact Name & Title:</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Kobus Eloff (Reaksiehoof)"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Organisation / Unit:</label>
                <input
                  type="text"
                  required
                  value={organisation}
                  onChange={(e) => setOrganisation(e.target.value)}
                  placeholder="e.g. Hartbeesfontein Plaaswag"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phone Number:</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+27 83 290 8812"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">WhatsApp (Optional):</label>
                  <input
                    type="text"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="+27832908812"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Area / Sector Coverage:</label>
                <input
                  type="text"
                  value={areaSector}
                  onChange={(e) => setAreaSector(e.target.value)}
                  placeholder="e.g. Sektor 2 & Rooipoort corridor"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Operational Notes:</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. 24/7 night shift commander with thermal scope vehicle"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded accent-amber-500"
                />
                <span className="text-slate-300 font-semibold">Active & Available for Dispatch</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold"
              >
                {t.common.cancel}
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black rounded-xl shadow-lg"
              >
                {editingContactId ? 'Save Changes' : 'Create Contact'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

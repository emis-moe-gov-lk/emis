import { useState } from "react";
import { User, Users, Plus, Trash2, Info } from "lucide-react";

export default function FamilyManagement({
  employee,
  familyList = [],
  childrenList = [],
  canCreate,
  canDelete,
  onAddSpouse,
  onDeleteSpouse,
  onAddChild,
  onDeleteChild,
}) {
  const [showSpouseModal, setShowSpouseModal] = useState(false);
  const [showChildModal, setShowChildModal] = useState(false);
  const [selectedFamilyId, setSelectedFamilyId] = useState(null);

  const isSingle = employee?.civil_status_id === "C01";

  return (
    <div className="antialiased min-h-screen pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {!isSingle ? (
          <div className="space-y-10">
            {/* ================= SPOUSE SECTION ================= */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold dark:text-white">
                    Family Management
                  </h2>
                  <p className="text-sm text-gray-500">
                    Manage spouse details and children records.
                  </p>
                </div>

                {canCreate && (
                  <button
                    onClick={() => setShowSpouseModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
                  >
                    <Plus size={16} /> Add Spouse
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-6">
                {familyList.length > 0 ? (
                  familyList.map((family) => (
                    <div
                      key={family.family_id}
                      className="flex flex-col md:flex-row bg-white dark:bg-gray-800 border rounded-2xl shadow-sm hover:shadow-md transition"
                    >
                      {/* Left Side */}
                      <div className="md:w-56 bg-gray-50 dark:bg-gray-900/50 p-6 flex flex-col items-center justify-center border-r">
                        <div className="relative">
                          <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl shadow text-indigo-600">
                            <User size={28} />
                          </div>

                          <span
                            className={`absolute -bottom-2 -right-2 text-xs px-2 py-1 rounded-full ${
                              family.active_status === 1
                                ? "bg-green-100 text-green-600"
                                : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            {family.active_status === 1 ? "Active" : "Inactive"}
                          </span>
                        </div>

                        <p className="mt-4 text-xs uppercase tracking-widest text-gray-400">
                          Spouse Record
                        </p>
                      </div>

                      {/* Right Side */}
                      <div className="flex-1 p-6">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="text-xl font-bold dark:text-white">
                              {family.spouse_name}
                            </h3>
                            <p className="text-sm text-gray-500 uppercase">
                              NIC: {family.nic}
                            </p>
                          </div>

                          {canDelete && (
                            <button
                              onClick={() => onDeleteSpouse?.(family.family_id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>

                        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
                          <InfoItem label="Date of Birth" value={family.dob} />
                          <InfoItem
                            label="Married Date"
                            value={family.married_date}
                          />
                          <InfoItem
                            label="Marriage Cert."
                            value={family.married_cf_no}
                          />
                        </div>

                        {canCreate && (
                          <div className="mt-6 pt-4 border-t flex justify-end">
                            <button
                              onClick={() => {
                                setSelectedFamilyId(family.family_id);
                                setShowChildModal(true);
                              }}
                              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
                            >
                              Add Child
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState text="No spouses found." />
                )}
              </div>
            </section>

            {/* ================= CHILDREN SECTION ================= */}
            <section>
              <div className="mb-6 flex items-center gap-4">
                <h2 className="text-xl font-bold dark:text-white">
                  Children's List
                </h2>
                <div className="h-px w-full bg-gray-200 dark:bg-gray-700" />
              </div>

              <div className="space-y-3">
                {childrenList.length > 0 ? (
                  childrenList.map((child) => (
                    <div
                      key={child.id}
                      className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border rounded-xl hover:shadow-sm transition"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                          <User size={16} />
                        </div>

                        <div>
                          <h4 className="font-bold dark:text-white">
                            {child.child_name}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {child.gender} | DOB: {child.date_of_birth} | BC No:{" "}
                            {child.birth_fc_no}
                          </p>
                        </div>
                      </div>

                      {canDelete && (
                        <button
                          onClick={() => onDeleteChild?.(child.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <EmptyState text="No children records found." />
                )}
              </div>
            </section>
          </div>
        ) : (
          <div className="max-w-md mx-auto mt-20 text-center">
            <div className="inline-flex p-4 bg-blue-100 rounded-full mb-4">
              <Info className="text-blue-600" />
            </div>
            <h3 className="text-lg font-bold dark:text-white">
              Civil Status: Single
            </h3>
            <p className="text-gray-500 mt-2">
              Family management is only available for married employees.
            </p>
          </div>
        )}
      </div>

      {/* ================= SPOUSE MODAL ================= */}
      {showSpouseModal && (
        <Modal
          title="Spouse Register"
          onClose={() => setShowSpouseModal(false)}
        >
          <SpouseForm
            onSubmit={(data) => {
              onAddSpouse?.(data);
              setShowSpouseModal(false);
            }}
          />
        </Modal>
      )}

      {/* ================= CHILD MODAL ================= */}
      {showChildModal && (
        <Modal title="Register Child" onClose={() => setShowChildModal(false)}>
          <ChildForm
            familyId={selectedFamilyId}
            onSubmit={(data) => {
              onAddChild?.(selectedFamilyId, data);
              setShowChildModal(false);
            }}
          />
        </Modal>
      )}
    </div>
  );
}

/* ================= SMALL COMPONENTS ================= */

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-400 uppercase font-bold">{label}</p>
      <p className="text-sm font-medium dark:text-gray-300">{value}</p>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="py-10 text-center border-2 border-dashed rounded-xl text-gray-400">
      <Users className="mx-auto mb-2" />
      {text}
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-900 w-full max-w-lg p-6 rounded-2xl shadow-xl">
        <div className="flex justify-between mb-4">
          <h3 className="font-bold text-lg dark:text-white">{title}</h3>
          <button onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function SpouseForm({ onSubmit }) {
  const [form, setForm] = useState({
    nic: "",
    name: "",
    married_date: "",
    married_cf_no: "",
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
      className="space-y-4"
    >
      <input
        placeholder="NIC"
        className="w-full border p-2 rounded"
        onChange={(e) => setForm({ ...form, nic: e.target.value })}
      />
      <input
        placeholder="Full Name"
        className="w-full border p-2 rounded"
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <input
        type="date"
        className="w-full border p-2 rounded"
        onChange={(e) => setForm({ ...form, married_date: e.target.value })}
      />
      <input
        placeholder="Marriage Certificate No"
        className="w-full border p-2 rounded"
        onChange={(e) => setForm({ ...form, married_cf_no: e.target.value })}
      />

      <div className="flex justify-end">
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
          Save
        </button>
      </div>
    </form>
  );
}

function ChildForm({ onSubmit }) {
  const [form, setForm] = useState({
    child_name: "",
    date_of_birth: "",
    gender: "",
    birth_fc_no: "",
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
      className="space-y-4"
    >
      <input
        placeholder="Full Name"
        className="w-full border p-2 rounded"
        onChange={(e) => setForm({ ...form, child_name: e.target.value })}
      />
      <input
        type="date"
        className="w-full border p-2 rounded"
        onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
      />
      <input
        placeholder="Gender"
        className="w-full border p-2 rounded"
        onChange={(e) => setForm({ ...form, gender: e.target.value })}
      />
      <input
        placeholder="Birth Certificate No"
        className="w-full border p-2 rounded"
        onChange={(e) => setForm({ ...form, birth_fc_no: e.target.value })}
      />

      <div className="flex justify-end">
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
          Save
        </button>
      </div>
    </form>
  );
}

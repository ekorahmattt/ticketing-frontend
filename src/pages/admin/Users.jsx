import React from 'react';
import Table from '../../components/ui/Table';
import StatusBadge from '../../components/ui/StatusBadge';

export default function Users() {
  const dummyUsers = [
    { name: "Super Admin", email: "admin@rs.com", role: "Super Admin", status: "Aktif" },
    { name: "Eko Rahmad", email: "eko.it@rs.com", role: "IT Support", status: "Aktif" },
    { name: "Rina Kusuma", email: "rina.it@rs.com", role: "IT Support", status: "Nonaktif" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Kelola Akun Admin</h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition shadow-sm w-full sm:w-auto">
          + Tambah Admin
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors duration-200">
        <Table headers={["Nama", "Email / Username", "Role", "Status Akun", "Aksi"]}>
          {dummyUsers.map((item, i) => (
            <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td className="py-4 px-6 font-medium text-gray-900 dark:text-gray-100">{item.name}</td>
              <td className="py-4 px-6">{item.email}</td>
              <td className="py-4 px-6">{item.role}</td>
              <td className="py-4 px-6"><StatusBadge status={item.status} /></td>
              <td className="py-4 px-6">
                <div className="flex gap-3">
                  <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium transition">Edit</button>
                  <button className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium transition">Hapus</button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </div>
    </div>
  );
}

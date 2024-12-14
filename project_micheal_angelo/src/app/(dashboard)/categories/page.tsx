"use client";
import React, { useState } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi"; // Editieren & Löschen Icons

interface Category {
  id: number;
  name: string;
}

const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([
    { id: 1, name: "Kategorie 1" },
    { id: 2, name: "Kategorie 2" },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [newCategoryName, setNewCategoryName] = useState("");

  // Kategorie hinzufügen
  const handleAddCategory = () => {
  // 1. Konsolen-Log hinzufügen, um zu sehen, ob die Funktion aufgerufen wird
  console.log("Hinzufügen-Button wurde gedrückt!");

  // 2. Überprüfen, ob der neue Kategorienaam korrekt ist
  console.log("Neuer Kategorienname:", newCategoryName);

  // 3. Sicherstellen, dass der Text nicht leer ist
  if (newCategoryName.trim() === "") {
    console.log("Kein Name eingegeben.");
    return;
  }

  // 4. Kategorie hinzufügen (z.B. mit einer ID basierend auf der Anzahl der Kategorien)
  const newCategory = {
    id: categories.length + 1, // Beispiel-ID, basierend auf der Länge des Arrays
    name: newCategoryName,
  };

  // 5. Neuen Zustand setzen
  setCategories([...categories, newCategory]);

  // 6. Überprüfen, ob die Liste der Kategorien jetzt aktualisiert wurde
  console.log("Aktualisierte Kategorienliste:", [...categories, newCategory]);

  // 7. Das Textfeld und das Modal schließen
  setNewCategoryName("");  // Input zurücksetzen
  setShowAddModal(false);  // Modal schließen
};

  // Kategorie bearbeiten
  const handleEditCategory = () => {
    if (selectedCategory && newCategoryName.trim() !== "") {
      setCategories(
        categories.map((cat) =>
          cat.id === selectedCategory.id
            ? { ...cat, name: newCategoryName }
            : cat
        )
      );
      setShowEditModal(false);
      setNewCategoryName("");
    }
  };

  // Kategorie löschen
  const handleDeleteCategory = () => {
    if (selectedCategory) {
      setCategories(
        categories.filter((cat) => cat.id !== selectedCategory.id)
      );
      setShowDeleteModal(false);
      setSelectedCategory(null);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Kategorien verwalten</h1>

        {/* Kategorienliste */}
            <ul>
            {categories.map((category) => (
                <li
                key={category.id}
                className="flex items-center justify-between py-2 px-4 border border-gray-300 rounded-md mb-2 transition-all duration-200 hover:border-2 hover:border-gray-500"
                >
                <span>{category.name}</span>
                <div>
                    <button
                    className="text-black mr-2"
                    onClick={() => {
                        setSelectedCategory(category);
                        setNewCategoryName(category.name);
                        setShowEditModal(true);
                    }}
                    >
                    <FiEdit2 />
                    </button>
                    <button
                    className="text-red-500"
                    onClick={() => {
                        setSelectedCategory(category);
                        setShowDeleteModal(true);
                    }}
                    >
                    <FiTrash2 />
                    </button>
                </div>
                </li>
            ))}
            </ul>


{/* Modal: Speichern Button */}
{showEditModal && selectedCategory && (
  <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
    <div className="bg-white p-4 rounded shadow-md">
      <h2 className="text-xl font-bold mb-2">Kategorie bearbeiten</h2>
      <input
        type="text"
        placeholder="Name der Kategorie"
        value={newCategoryName}
        onChange={(e) => setNewCategoryName(e.target.value)}
        className="border p-2 w-full mb-2"
      />
      <div className="flex justify-end">
        <button
          className="mr-2 px-4 py-2 text-gray-500"
          onClick={() => setShowEditModal(false)}
        >
          Abbrechen
        </button>
        <button
          className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-700 transition-colors duration-200"
          onClick={handleEditCategory}
        >
          Speichern
        </button>
      </div>
    </div>
  </div>
)}

{/* Modal: Bestätigung löschen */}
{showDeleteModal && selectedCategory && (
  <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
    <div className="bg-white p-4 rounded shadow-md">
      <h2 className="text-xl font-bold mb-2">Bist du sicher?</h2>
      <p>Die Kategorie &quot;{selectedCategory.name}&quot; wird gelöscht.</p>
      <div className="flex justify-end mt-4">
        <button
          className="mr-2 px-4 py-2 text-gray-500"
          onClick={() => setShowDeleteModal(false)}
        >
          Abbrechen
        </button>
        <button
          className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-700 transition-colors duration-200"
          onClick={handleDeleteCategory}
        >
          Löschen
        </button>
      </div>
    </div>
  </div>
)}



      {/* Kategorie hinzufügen Button */}
        <button
        className="absolute top-0 right-0 m-4 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-700 transition-colors duration-200"
        onClick={() => setShowAddModal(true)}
        >
        Kategorie hinzufügen
        </button>


      {/* Modal: Kategorie hinzufügen */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-4 rounded shadow-md">
            <h2 className="text-xl font-bold mb-2">Kategorie hinzufügen</h2>
            <input
              type="text"
              placeholder="Name der Kategorie"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="border p-2 w-full mb-2"
            />
            <div className="flex justify-end">
              <button
                className="mr-2 px-4 py-2 text-gray-500"
                onClick={() => setShowAddModal(false)}
              >
                Abbrechen
              </button>
              <button
                className="px-4 py-2 text-white bg-black rounded"
                onClick={handleAddCategory}
                >
                Hinzufügen
              </button>

            </div>
          </div>
        </div>
      )}

      {/* Modal: Kategorie bearbeiten */}
{showEditModal && selectedCategory && (
  <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
    <div className="bg-white p-4 rounded shadow-md">
      <h2 className="text-xl font-bold mb-2">Kategorie bearbeiten</h2>
      <input
        type="text"
        placeholder="Name der Kategorie"
        value={newCategoryName}
        onChange={(e) => setNewCategoryName(e.target.value)}
        className="border p-2 w-full mb-2"
      />
      <div className="flex justify-end">
        <button
          className="mr-2 px-4 py-2 text-gray-500"
          onClick={() => setShowEditModal(false)}
        >
          Abbrechen
        </button>
        <button
          className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-700 transition-colors duration-200"
          onClick={handleEditCategory}
        >
          Speichern
        </button>
      </div>
    </div>
  </div>
)}


      {/* Modal: Bestätigung löschen */}
      {showDeleteModal && selectedCategory && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-4 rounded shadow-md">
            <h2 className="text-xl font-bold mb-2">Bist du sicher?</h2>
            <p>Die Kategorie &quot;{selectedCategory.name}&quot; wird gelöscht.</p>
            <div className="flex justify-end mt-4">
              <button
                className="mr-2 px-4 py-2 text-gray-500"
                onClick={() => setShowDeleteModal(false)}
              >
                Abbrechen
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white"
                onClick={handleDeleteCategory}
              >
                Löschen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;


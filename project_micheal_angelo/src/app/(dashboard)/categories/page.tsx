"use client";

import React, { useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import useSWR from "swr"
import { Category } from "@type/category";
import { Button } from "@components/ui/button";

const CategoriesPage = () => {
    const { data: categories, mutate } = useSWR<Category[]>("/api/category", async (url: string) => {
        return await (await fetch(url)).json()
    })

    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(
        null
    );
    const [newCategoryName, setNewCategoryName] = useState("");

    const handleAddCategory = () => {
        if (newCategoryName.trim() === "") {
            console.log("Kein Name eingegeben.");
            return;
        }

        fetch("/api/category", {
            method: "POST",
            body: JSON.stringify({ name: newCategoryName }),
            headers: {
                "Content-Type": "application/json",
            },
        })
            .finally(() => {
                setShowAddModal(false);
                setNewCategoryName("");
                void mutate();
            })
    };

    // Kategorie bearbeiten
    const handleEditCategory = () => {
        if (!selectedCategory || newCategoryName.trim() === "") {
            return;
        }

        fetch(`/api/category/${selectedCategory.id}`, {
            method: "PUT",
            body: JSON.stringify({ name: newCategoryName }),
            headers: {
                "Content-Type": "application/json",
            },
        })
            .finally(() => {
                setShowEditModal(false);
                setNewCategoryName("");
                void mutate();
            })
    };

    const handleDeleteCategory = () => {
        if (!selectedCategory) {
            return;
        }

        fetch(`/api/category/${selectedCategory.id}`, {
            method: "DELETE",
        })
            .finally(() => {
                setShowDeleteModal(false);
                void mutate();
            })
    };

    if (!categories) {
        return <div>Lade...</div>;
    }

    return (
        <div className="p-8">
            <header className="flex flex-row w-full justify-between">
                <h1 className="text-2xl font-bold mb-4">Kategorien verwalten</h1>
                <Button
                    onClick={() => {
                        setNewCategoryName("");
                        setShowAddModal(true)
                    }}
                >
                    Kategorie hinzufügen
                </Button>
            </header>
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
                                <Edit/>
                            </button>
                            <button
                                className="text-red-500"
                                onClick={() => {
                                    setSelectedCategory(category);
                                    setShowDeleteModal(true);
                                }}
                            >
                                <Trash2/>
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

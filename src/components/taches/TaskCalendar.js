"use client";

import { useState, useEffect } from 'react';
import { FiPlus, FiEye, FiEdit2, FiCheck, FiCheckCircle, FiAlertCircle, FiClock } from 'react-icons/fi';

export default function TaskCalendar({ tasks, onCreateTask, onViewTask, onUpdateTask }) {
  const [mounted, setMounted] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // create, view, edit
  const [selectedTask, setSelectedTask] = useState(null);
  const [newTask, setNewTask] = useState({
    titre: "",
    description: "",
    date_echeance: "",
    priorite: "moyenne",
    statut: "à faire"
  });
  
  const taskList = tasks || [];
  
  // S'assurer que le composant est monté côté client
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return <div>Chargement du calendrier...</div>;
  }
  
  // Regrouper les tâches par date
  const tasksByDate = {};
  taskList.forEach(task => {
    if (!task.date_echeance) return;
    
    const date = new Date(task.date_echeance).toISOString().split('T')[0]; // Format YYYY-MM-DD
    if (!tasksByDate[date]) {
      tasksByDate[date] = [];
    }
    tasksByDate[date].push(task);
  });
  
  // Obtenir le mois actuel
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  // Fonction pour générer les jours du mois
  const getDaysInMonth = (month, year) => {
    const date = new Date(year, month, 1);
    const days = [];
    
    // Obtenir le premier jour de la semaine (0 = dimanche, 1 = lundi, etc.)
    const firstDayOfMonth = date.getDay();
    
    // Ajuster pour la semaine commençant le lundi (0 = lundi, 6 = dimanche)
    const adjustedFirstDay = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1;
    
    // Ajouter des jours vides pour aligner le premier jour du mois
    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push({ day: null, date: null });
    }
    
    // Ajouter les jours du mois
    while (date.getMonth() === month) {
      const dayObj = {
        day: date.getDate(),
        date: new Date(date).toISOString().split('T')[0],
        isToday: date.getDate() === today.getDate() && 
                 date.getMonth() === today.getMonth() && 
                 date.getFullYear() === today.getFullYear()
      };
      days.push(dayObj);
      date.setDate(date.getDate() + 1);
    }
    
    return days;
  };
  
  const days = getDaysInMonth(currentMonth, currentYear);
  
  // Noms des jours de la semaine (commençant par lundi)
  const weekdays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  
  // Noms des mois
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  
  // Gérer le clic sur une date pour créer une tâche
  const handleDateClick = (date) => {
    if (!date) return;
    
    setSelectedDate(date);
    setNewTask({
      ...newTask,
      date_echeance: date
    });
    setModalMode("create");
    setShowModal(true);
  };
  
  // Gérer le clic sur une tâche pour la visualiser
  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setModalMode("view");
    setShowModal(true);
  };
  
  // Gérer la création d'une nouvelle tâche
  const handleCreateTask = () => {
    if (onCreateTask && newTask.titre) {
      onCreateTask(newTask);
      setShowModal(false);
      setNewTask({
        titre: "",
        description: "",
        date_echeance: "",
        priorite: "moyenne",
        statut: "à faire"
      });
    }
  };
  
  // Gérer la modification d'une tâche existante
  const handleEditTask = () => {
    setModalMode("edit");
    setNewTask({
      titre: selectedTask.titre,
      description: selectedTask.description || "",
      date_echeance: selectedTask.date_echeance,
      priorite: selectedTask.priorite || "moyenne",
      statut: selectedTask.statut || "à faire"
    });
  };
  
  // Gérer la mise à jour d'une tâche
  const handleUpdateTask = () => {
    if (onUpdateTask && newTask.titre) {
      onUpdateTask(selectedTask.id, newTask);
      setShowModal(false);
    }
  };
  
  // Gérer le changement de statut rapide d'une tâche
  const handleQuickStatusChange = (task, e) => {
    e.stopPropagation(); // Éviter de déclencher le clic sur la tâche
    
    if (onUpdateTask) {
      const newStatus = task.statut === "terminée" ? "à faire" : "terminée";
      onUpdateTask(task.id, { ...task, statut: newStatus });
    }
  };
  
  // Obtenir la couleur de fond en fonction de la priorité et du statut
  const getTaskBgColor = (task) => {
    if (task.statut === "terminée") return "bg-green-100 hover:bg-green-200 text-green-800";
    
    switch (task.priorite) {
      case "haute":
        return "bg-red-100 hover:bg-red-200 text-red-800";
      case "moyenne":
        return "bg-yellow-100 hover:bg-yellow-200 text-yellow-800";
      case "basse":
      default:
        return "bg-blue-100 hover:bg-blue-200 text-blue-800";
    }
  };
  
  // Obtenir l'icône en fonction de la priorité
  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "haute":
        return <FiAlertCircle className="mr-1" />;
      case "moyenne":
        return <FiClock className="mr-1" />;
      default:
        return null;
    }
  };
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-md my-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Calendrier des tâches - {monthNames[currentMonth]} {currentYear}</h3>
        <button 
          className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center text-sm"
          onClick={() => handleDateClick(new Date().toISOString().split('T')[0])}
        >
          <FiPlus className="mr-1" /> Nouvelle tâche
        </button>
      </div>
      
      {/* Calendrier interactif */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="grid grid-cols-7 border-b border-gray-200">
          {/* Entêtes des jours de la semaine */}
          {weekdays.map(day => (
            <div key={day} className="text-center font-medium py-2 text-gray-700 border-r border-gray-200 last:border-r-0">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7">
          {/* Jours du mois */}
          {days.map((dayObj, index) => (
            <div 
              key={index} 
              className={`
                min-h-24 border-r border-b border-gray-200 last:border-r-0
                ${dayObj.isToday ? 'bg-blue-50' : 'bg-white'}
                ${!dayObj.day ? 'bg-gray-50' : 'hover:bg-gray-50 cursor-pointer'}
                transition-colors duration-200
              `}
              onClick={() => dayObj.day && handleDateClick(dayObj.date)}
            >
              {dayObj.day && (
                <>
                  <div className="flex justify-between items-center p-1">
                    <div className={`text-sm ${dayObj.isToday ? 'font-bold text-blue-600' : 'text-gray-500'}`}>
                      {dayObj.day}
                    </div>
                    {dayObj.date === selectedDate && (
                      <button
                        className="w-5 h-5 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDateClick(dayObj.date);
                        }}
                      >
                        <FiPlus size={12} />
                      </button>
                    )}
                  </div>
                  <div className="p-1 space-y-1 max-h-32 overflow-y-auto">
                    {tasksByDate[dayObj.date]?.map(task => (
                      <div 
                        key={task.id}
                        className={`
                          text-xs p-1 rounded flex items-center justify-between cursor-pointer 
                          ${getTaskBgColor(task)}
                        `}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTaskClick(task);
                        }}
                      >
                        <div className="flex items-center truncate flex-grow">
                          {getPriorityIcon(task.priorite)}
                          <span className="truncate">{task.titre}</span>
                        </div>
                        <button 
                          className={`w-4 h-4 flex-shrink-0 ml-1 ${
                            task.statut === "terminée" ? "text-green-600" : "text-gray-400 hover:text-green-600"
                          }`}
                          onClick={(e) => handleQuickStatusChange(task, e)}
                          title={task.statut === "terminée" ? "Marquer comme à faire" : "Marquer comme terminée"}
                        >
                          <FiCheckCircle size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Modal pour créer/voir/éditer une tâche */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg overflow-hidden shadow-xl max-w-md w-full">
            <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                {modalMode === "create" && "Nouvelle tâche"}
                {modalMode === "view" && "Détails de la tâche"}
                {modalMode === "edit" && "Modifier la tâche"}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                &times;
              </button>
            </div>
            
            <div className="p-4">
              {modalMode === "view" ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-medium">{selectedTask.titre}</h4>
                    <p className="text-sm text-gray-500">Échéance: {new Date(selectedTask.date_echeance).toLocaleDateString()}</p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${getTaskBgColor(selectedTask)}`}>
                      {selectedTask.statut}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getTaskBgColor({...selectedTask, statut: ""})}`}>
                      Priorité: {selectedTask.priorite}
                    </span>
                  </div>
                  
                  {selectedTask.description && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700">Description:</h5>
                      <p className="text-sm text-gray-600 whitespace-pre-line">{selectedTask.description}</p>
                    </div>
                  )}
                  
                  <div className="pt-4 border-t border-gray-200 flex justify-end space-x-2">
                    <button
                      onClick={handleEditTask}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                    >
                      <FiEdit2 className="mr-1" /> Modifier
                    </button>
                    <button
                      onClick={() => handleQuickStatusChange(selectedTask, { stopPropagation: () => {} })}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                    >
                      <FiCheck className="mr-1" />
                      {selectedTask.statut === "terminée" ? "Marquer à faire" : "Marquer terminée"}
                    </button>
                  </div>
                </div>
              ) : (
                <form className="space-y-4">
                  <div>
                    <label htmlFor="titre" className="block text-sm font-medium text-gray-700">Titre *</label>
                    <input
                      type="text"
                      id="titre"
                      value={newTask.titre}
                      onChange={(e) => setNewTask({...newTask, titre: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="date_echeance" className="block text-sm font-medium text-gray-700">Date d'échéance *</label>
                    <input
                      type="date"
                      id="date_echeance"
                      value={newTask.date_echeance}
                      onChange={(e) => setNewTask({...newTask, date_echeance: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="priorite" className="block text-sm font-medium text-gray-700">Priorité</label>
                    <select
                      id="priorite"
                      value={newTask.priorite}
                      onChange={(e) => setNewTask({...newTask, priorite: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="basse">Basse</option>
                      <option value="moyenne">Moyenne</option>
                      <option value="haute">Haute</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      id="description"
                      value={newTask.description}
                      onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                      rows={3}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    ></textarea>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200 flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      onClick={modalMode === "create" ? handleCreateTask : handleUpdateTask}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      {modalMode === "create" ? "Créer" : "Mettre à jour"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

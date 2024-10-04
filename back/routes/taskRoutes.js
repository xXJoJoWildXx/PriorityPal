const express = require('express');
const TaskModel = require('../Models/Task');
const router = express.Router();
const mongoose = require('mongoose');


// Obtener todas las tareas
router.get('/', async (req, res) => {
    try {
        const tasks = await TaskModel.find().populate('area_id'); 
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Crear una nueva tarea
router.post('/', async (req, res) => {
    const { id_users, deadline, description, area_id } = req.body;

    try {
        const newTask = new TaskModel({
            id_users,
            deadline,
            description,
            area_id
        });

        const savedTask = await newTask.save();
        res.status(201).json(savedTask);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Actualizar una tarea
router.put('/:id', async (req, res) => {
    try {
        const updatedTask = await TaskModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedTask);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Eliminar una tarea
router.delete('/:id', async (req, res) => {
    try {
        const deletedTask = await TaskModel.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Tarea eliminada' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


// Fuzzy Search
router.get('/search', async (req, res) => {
    const busqueda = req.query.q;
    console.log("Buscando:", busqueda); // Imprime la búsqueda
    try {
        const resultadoBusqueda = await TaskModel.aggregate([
            {
                $search: {
                    compound: {
                        should: [
                            {
                                // Verificar si es un ID válido
                                text: {
                                    query: mongoose.Types.ObjectId.isValid(busqueda) ? busqueda : "", // Asegurarse de que sea un ID válido
                                    path: "_id",
                                    fuzzy: {
                                        maxEdits: 1,
                                        prefixLength: 1
                                    }
                                }
                            },
                            {
                                text: {
                                    query: busqueda,
                                    path: "description",
                                    fuzzy: {
                                        maxEdits: 1,
                                        prefixLength: 1
                                    }
                                }
                            }
                        ]
                    }
                }
            }
        ]);

        console.log("Resultados encontrados:", resultadoBusqueda.length); // Imprime la cantidad de resultados
        res.status(200).json(resultadoBusqueda);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
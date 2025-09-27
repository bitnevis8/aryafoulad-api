const express = require("express");
const ProjectsController = require("./controller");

const router = express.Router();

// Project Types
router.get("/types/getAll", ProjectsController.getAllProjectTypes);

// Form Templates
router.get("/forms/template/:code", ProjectsController.getFormTemplateByCode);

// Project Requests
router.get("/requests/getAll", ProjectsController.getAllProjects);
router.post("/requests/create", ProjectsController.createProjectRequest);
router.get("/requests/getOne/:id", ProjectsController.getProjectById);

// Form Submissions (e.g., inspection reports)
router.post("/forms/submit", ProjectsController.submitForm);
router.get("/forms/submission/:id", ProjectsController.getFormSubmissionById);
router.get("/forms/by-project/:projectId", ProjectsController.getFormSubmissionsByProject);
router.put("/forms/update/:id", ProjectsController.updateFormSubmission);
router.delete("/forms/delete/:id", ProjectsController.deleteFormSubmission);

// Project status
router.patch("/requests/status/:id", ProjectsController.updateProjectStatus);

// Customers
router.get('/customers/find', ProjectsController.findCustomerAndProjects);

// Cost items
router.post('/costs/create', ProjectsController.addCostItem);
router.delete('/costs/delete/:id', ProjectsController.removeCostItem);

// Payments
router.post('/payments/create', ProjectsController.addPayment);
router.delete('/payments/delete/:id', ProjectsController.removePayment);

// Inspections (calendar)
router.post('/inspections/create', ProjectsController.createInspection);
router.get('/inspections/calendar', ProjectsController.getInspectionsCalendar);

module.exports = router;


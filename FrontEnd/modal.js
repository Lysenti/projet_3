var categorySelect = document.createElement('select');
categorySelect.setAttribute('name', 'category');
categorySelect.setAttribute('id', 'category');

// Fonction pour gérer l'affichage du bouton "Modifier"
function toggleModifyButton(authenticated) {
    const modifyButton = document.querySelector('.modify-button');
    if (authenticated) {
        if (!modifyButton) {
            createModifyButton();
        }
    } else {
        if (modifyButton) {
            modifyButton.remove();
        }
    }
}

function createModifyButton() {
    const modifyButton = document.createElement('button');
    modifyButton.textContent = 'Modifier';
    modifyButton.classList.add('modify-button');
    modifyButton.addEventListener('click', openModal);
    const portfolioSection = document.getElementById('portfolio');
    if (portfolioSection) {
        const projectsTitle = portfolioSection.querySelector('h2');
        if (projectsTitle) {
            projectsTitle.insertAdjacentElement('afterend', modifyButton);
        }
    }
}

function addProject(imageFile, title, categoryId) {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('title', title);
    formData.append('category', categoryId);

    fetch('http://localhost:5678/api/works', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(errData => {
                throw new Error(errData.message || 'Erreur lors de l\'ajout du projet.');
            });
        }
        return response.json();
    })
    .then(() => {
        console.log("Projet ajouté avec succès");
        displayProjects();
        closeModal();
    })
    .catch(error => {
        console.error('Une erreur s\'est produite lors de l\'ajout du projet :', error);
        alert('Une erreur s\'est produite lors de l\'ajout du projet. Veuillez réessayer.');
    });
}

function deleteProject(projectId) {
    return fetch(`http://localhost:5678/api/works/${projectId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(errData => {
                throw new Error(errData.message || 'Erreur lors de la suppression du projet.');
            });
        }
        console.log(`Projet ${projectId} supprimé avec succès.`);
    });
}

function fetchAndDisplayCategories() {
    fetch('http://localhost:5678/api/categories', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Erreur lors de la récupération des catégories.');
        }
    })
    .then(categories => {
        categorySelect.innerHTML = ''; // clean du contenu précédent
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    })
    .catch(error => {
        console.error('Une erreur s\'est produite lors de la récupération des catégories :', error);
    });
}

fetchAndDisplayCategories();

function addCloseButton(modal) {
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '&times;';
    closeButton.classList.add('close-button'); 
    closeButton.addEventListener('click', closeModal);

    modal.appendChild(closeButton);
}

function displayProjectsInModal(modal) {
    fetch('http://localhost:5678/api/works')
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur de récupération des projets.');
            }
            return response.json();
        })
        .then(data => {
            modal.innerHTML = ''; // suppression du précédent contenu

            data.forEach(project => {
                const projectElement = document.createElement('div');
                projectElement.classList.add('modal-project');
                projectElement.setAttribute('id', `project-${project.id}`);

                const imageElement = document.createElement('img');
                imageElement.src = project.imageUrl;
                imageElement.alt = project.title;

                const deleteButton = document.createElement('button');
                deleteButton.innerHTML = '&#128465;'; // l'icone "poubelle"
                deleteButton.classList.add('delete-button');

                deleteButton.addEventListener('click', () => {
                    deleteProject(project.id)
                        .then(() => {
                            projectElement.remove(); // Retrait du projet de la modale
                        })
                        .catch(error => {
                            console.error('Erreur lors de la suppression du projet :', error);
                            alert('Erreur lors de la suppression du projet. Veuillez réessayer.');
                        });
                });

                projectElement.appendChild(imageElement);
                projectElement.appendChild(deleteButton);

                modal.appendChild(projectElement);
            });

            // Ajout du bouton pour ajouter le nouveau projet
            const addProjetButton = document.createElement('button');
            addProjetButton.textContent = 'Ajouter un projet';
            addProjetButton.classList.add('add-photo-button');

            addProjetButton.addEventListener('click', (event) => {
                event.stopPropagation();
                addProjectFormToModal(modal);
            });

            modal.appendChild(addProjetButton);
            addCloseButton(modal);
        })
        .catch(error => {
            console.error('Erreur lors de la récupération des projets :', error);
        });
}

function openModal() {
    if (document.querySelector('.modal-container')) {
        console.log("Une modale est déjà ouverte");
        return;
    }

    const backgroundModal = document.createElement('div');
    backgroundModal.classList.add('background-modal');

    const modalContainer = document.createElement('div');
    modalContainer.classList.add('modal-container');

    const modal = document.createElement('div');
    modal.classList.add('custom-modal');

    displayProjectsInModal(modal);

    modalContainer.appendChild(modal);
    document.body.appendChild(backgroundModal);
    document.body.appendChild(modalContainer);
    backgroundModal.addEventListener('click', closeModal);
    modalContainer.addEventListener('click', closeModal);
}

function addProjectFormToModal(modal) {
    modal.innerHTML = '';

    const form = document.createElement('form');
    form.classList.add('add-project-form');

    const imageFileInput = document.createElement('input');
    imageFileInput.setAttribute('type', 'file');
    imageFileInput.setAttribute('accept', 'image/*');
    imageFileInput.setAttribute('name', 'image');

    const titleInput = document.createElement('input');
    titleInput.setAttribute('type', 'text');
    titleInput.setAttribute('placeholder', 'Titre du projet');
    titleInput.setAttribute('name', 'title');

    const submitButton = document.createElement('button');
    submitButton.setAttribute('type', 'submit');
    submitButton.textContent = 'Ajouter';

    form.appendChild(imageFileInput);
    form.appendChild(titleInput);
    form.appendChild(categorySelect);
    form.appendChild(submitButton);

    modal.appendChild(form);
    addCloseButton(modal);

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const imageFile = imageFileInput.files[0];
        const title = titleInput.value;
        const categoryId = categorySelect.value;

        addProject(imageFile, title, categoryId);
    });

    imageFileInput.addEventListener('click', (event) => {
        event.stopPropagation();
    });

    titleInput.addEventListener('click', (event) => {
        event.stopPropagation();
    });

    form.addEventListener('click', (event) => {
        event.stopPropagation();
    });
}

function closeModal() {
    const modalContainer = document.querySelector('.modal-container');
    const backgroundModal = document.querySelector('.background-modal');

    if (modalContainer) {
        modalContainer.remove();
    }

    if (backgroundModal) {
        backgroundModal.remove();
    }
}

var categorySelect = document.createElement('select');
categorySelect.setAttribute('name', 'category');
categorySelect.setAttribute('id', 'category');


function createModifyButton() {
    const projectsHeader = document.querySelector('.projects-header');
    if (projectsHeader) {
        const modifyButton = document.createElement('button');
        modifyButton.classList.add('modify-button');
        modifyButton.innerHTML = '<i class="fa fa-pen-to-square"></i> Modifier';
        modifyButton.addEventListener('click', openModal);
        projectsHeader.appendChild(modifyButton);
    }
}



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

        // Suppression directe de l'élément du projet dans la page d'accueil
        const projectElement = document.getElementById(`project-${projectId}`);
        if (projectElement) {
            projectElement.remove();
        }
    })
    .catch(error => {
        console.error('Erreur lors de la suppression du projet :', error);
        alert('Erreur lors de la suppression du projet. Veuillez réessayer.');
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
            modal.innerHTML = ''; // suppression du contenu précédent

            //Ajout du header de la modale
            const modalHeader = document.createElement('div');
            modalHeader.classList.add('modal-header');

            const title = document.createElement('h2');
            title.textContent = 'Galerie photo';
            title.classList.add('modal-title');

            modalHeader.appendChild(title);
            modal.appendChild(modalHeader);

            // Ajout container projets
            const modalContent = document.createElement('div');
            modalContent.classList.add('modal-content');

            data.forEach(project => {
                const projectElement = document.createElement('div');
                projectElement.classList.add('modal-project');
                projectElement.setAttribute('id', `project-${project.id}`);

                const imageElement = document.createElement('img');
                imageElement.src = project.imageUrl;
                imageElement.alt = project.title;

                const deleteButton = document.createElement('button');
                deleteButton.classList.add('delete-button');

                const removeIcon = document.createElement('i');
                removeIcon.classList.add('far', 'fa-trash-alt');

                deleteButton.appendChild(removeIcon);

                deleteButton.addEventListener('click', () => {
                    deleteProject(project.id)
                        .then(() => {
                            projectElement.remove(); // Suppression du projet de la modale
                        })
                        .catch(error => {
                            console.error('Erreur lors de la suppression du projet :', error);
                            alert('Erreur lors de la suppression du projet. Veuillez réessayer.');
                        });
                });

                projectElement.appendChild(imageElement);
                projectElement.appendChild(deleteButton);

                modalContent.appendChild(projectElement);
            });

            modal.appendChild(modalContent);

        // Ajout du footer
            const modalFooter = document.createElement('div');
            modalFooter.classList.add('modal-footer');

            const addProjetButton = document.createElement('button');
            addProjetButton.textContent = 'Ajouter un projet';
            addProjetButton.classList.add('add-photo-button');

            addProjetButton.addEventListener('click', (event) => {
                event.stopPropagation();
                addProjectFormToModal(modal);
            });

            modalFooter.appendChild(addProjetButton);
            modal.appendChild(modalFooter);

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
    modal.addEventListener('click', (event) => {
        event.stopPropagation();
    });
}

function addProjectFormToModal(modal) {
    modal.innerHTML = '';

    // Bouton de retour
    addBackButton(modal);

    const form = document.createElement('form');
    form.classList.add('add-project-form');

     // Titre "Ajout photo"
     const photoTitle= document.createElement('h3');
     photoTitle.className = 'add-photo-title';
     photoTitle.textContent = 'Ajout photo';

     // Container pour l'input personnalisé de type file
    const fileInputContainer = document.createElement('div');
    fileInputContainer.className = 'file-input-container';

    const rectangle = document.createElement('div');
    rectangle.className = 'file-input-rectangle';

    // Ajout de l'icône SVG
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("class", "upload-icon");
    svg.innerHTML = '<path d="M0,2v20h24V2H0z M22,4v11l-5-5l-5,5l-3-3l-7,7V4H22z"></path>'; 

    
    const label = document.createElement('label');
    label.className = 'file-input-trigger';
    label.textContent = '+Ajouter photo';

    const input = document.createElement('input');
    input.type = 'file';
    input.className = 'file-input';
    input.accept = 'image/*';
    input.name = 'image';
    input.required = true;
    input.style.display = 'none';
    input.addEventListener('change', handleFileSelect);
    label.appendChild(input);

    const acceptedFormats = document.createElement('div');
    acceptedFormats.className = 'accepted-formats';
    acceptedFormats.textContent = 'JPG, PNG - 4Mo max';

    
    // Création et ajout de l'aperçu de l'image
    const imagePreview = document.createElement('img');
    imagePreview.id = 'image-preview';
    imagePreview.className = 'image-preview';
    imagePreview.style.display = 'none';

    rectangle.appendChild(svg);
    rectangle.appendChild(imagePreview);
    rectangle.appendChild(label);
    rectangle.appendChild(acceptedFormats);
    fileInputContainer.appendChild(rectangle);

    // Titre pour le champ "Titre du projet"
    const titleLabel = document.createElement('h4');
    titleLabel.className = 'input-title';
    titleLabel.textContent = 'Titre';

    // Champ de texte pour le titre du projet
    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.name = 'title';
    titleInput.required = true;

     // Titre pour le sélecteur de catégorie
     const categoryLabel = document.createElement('h4');
     categoryLabel.className = 'input-title';
     categoryLabel.textContent = 'Catégorie';

     // Sélecteur de catégorie
    const categorySelect = document.createElement('select');
    categorySelect.name = 'category';
    categorySelect.required = true;

    // Ajout de l'option vide
    const emptyOption = document.createElement('option');
    emptyOption.value = '';
    emptyOption.textContent = '';
    emptyOption.disabled = true;
    emptyOption.selected = true;
    categorySelect.appendChild(emptyOption);

   // Ajout des autres options (exemple)
   const categories = [
    { id: 1, name: 'Objets' },
    { id: 2, name: 'Appartements' },
    { id: 3, name: 'Hôtels et restaurants' }
    ];
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        categorySelect.appendChild(option);
    });

    form.appendChild(photoTitle); // Ajout du titre "Ajout photo"
    form.appendChild(fileInputContainer);
    form.appendChild(titleLabel); // Ajout du titre pour le champ de texte
    form.appendChild(titleInput);
    form.appendChild(categoryLabel); // Ajout du titre pour le sélecteur de catégorie
    form.appendChild(categorySelect);

    // Conteneur pour le bouton "Valider" avec bordure supérieure
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'add-project-button-container';

    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.textContent = 'Valider';
    submitButton.classList.add('add-project-button');
    submitButton.disabled = true;
    buttonContainer.appendChild(submitButton);

    form.appendChild(buttonContainer);
    
    modal.appendChild(form);
    addCloseButton(modal);

    // Fonction pour vérifier si tous les champs sont remplis
    function checkFormValidity() {
        submitButton.disabled = !(input.files.length > 0 && titleInput.value.trim() !== '' && categorySelect.value !== '');
    }

    // Ajouter des écouteurs d'événements pour vérifier la validité du formulaire
    input.addEventListener('change', checkFormValidity);
    titleInput.addEventListener('input', checkFormValidity);
    categorySelect.addEventListener('change', checkFormValidity);


    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const imageFile = input.files[0];
        const title = titleInput.value;
        const categoryId = categorySelect.value;
        addProject(imageFile, title, categoryId);
    });
}

function handleFileSelect(event) {
    var files = event.target.files;
    if (files.length === 1) {
        var file = files[0];
        var reader = new FileReader();

        reader.onload = function(e) {
            var preview = document.getElementById('image-preview');
            preview.src = e.target.result;
            preview.style.display = 'block';
            preview.style.width = '33%';  // Ajuste la largeur à 33%
            preview.style.height = 'auto'; // Ajuste la hauteur proportionnellement
            preview.style.margin = '0 auto'; // Centre l'image
        };

        reader.readAsDataURL(file);
    }
}

function addBackButton(modal) {
    const backButton = document.createElement('button');
    backButton.innerHTML = '&#8592;'; 
    backButton.classList.add('back-button'); 
    backButton.addEventListener('click', () => displayProjectsInModal(modal));
    modal.appendChild(backButton);
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

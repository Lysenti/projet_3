var loginButton = document.getElementById('loginButton');
var authForm = document.getElementById('authForm');

function updateLoginButton(authenticated) {
    if (authenticated) {
        loginButton.textContent = 'logout';
    } else {
        loginButton.textContent = 'login';
    }
}

// Gestion de la connexion/déconnexion
function loginLogoutHandler() {
    if (localStorage.getItem('isAuthenticated') === 'true') {
        logoutHandler();
    } else {
        // Redirection vers la page d'authentification
        window.location.href = 'auth.html';
    }
}

function logoutHandler() {
    console.log("Je clique sur le bouton de déconnexion");
    if (localStorage.getItem('isAuthenticated') === 'true') {
        console.log("Je suis authentifié, je vais me déconnecter");
        // Réinitialisation de l'état d'authentification
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userId');
        localStorage.removeItem('token');
        console.log("Je suis maintenant déconnecté");
        // Mettre à jour l'interface utilisateur
        updateLoginButton(false);
        console.log("Je vais être redirigé vers la page d'accueil");

        window.location.replace('index.html');
    } else {
        console.log("Je ne suis pas authentifié, pas de déconnexion nécessaire.");
    }
}

loginButton.addEventListener('click', loginLogoutHandler);

// Soumission formulaire authentification
authForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value();

    fetch('http://localhost:5678/api/users/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    })
    .then(response => {
        if (response.ok) {
            // Authentification réussie
            return response.json();
        } else {
            throw new Error('Identifiants incorrects');
        }
    })
    .then(data => {
        // Stockage des informations 
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('token', data.token);
        localStorage.setItem('isAuthenticated', 'true');

        updateLoginButton(true);
        console.log("je suis connecté");
        // Redirection 
        window.location.replace('index.html');
    })
    .catch(error => {
        alert(error.message);
    });
});

// Fonction pour fermer la modale
function closeModal() {
    const backgroundModal = document.querySelector('.background-modal');
    const modalContainer = document.querySelector('.modal-container');

    if (backgroundModal && modalContainer) {
        backgroundModal.remove();
        modalContainer.remove();
    }
}

// Fonction pour supprimer un projet
function removeProject(userId, token, projectId) {
    fetch(`http://localhost:5678/api/works/${projectId}?userId=${userId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erreur lors de la suppression du projet.');
        }
        console.log('Tentative de suppression du projet avec l\'identifiant :', projectId);
        const projectElement = document.getElementById(`project-${projectId}`);
        console.log('Element à supprimer :', projectElement);
        if (projectElement) {
            projectElement.remove();
            console.log('Élément supprimé avec succès !');
        } else {
            console.log('Aucun élément correspondant trouvé dans le DOM.');
        }
    })
    .catch(error => {
        console.error('Une erreur s\'est produite lors de la suppression du projet :', error);
    });
}

// Fonction pour ajouter un nouveau projet
function addProject(imageUrl, title) {
    const projectData = {
        imageUrl: imageUrl,
        title: title,
    };

    fetch('http://localhost:5678/api/works', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erreur lors de l\'ajout du projet.');
        }
        closeModal();
        openModal(); // Actualiser la modale
    })
    .catch(error => {
        console.error('Une erreur s\'est produite lors de l\'ajout du projet :', error);
    });
}

// Fonction pour ouvrir la modale et récupérer les données des works
function openModal() {
    let modalContainer = document.querySelector('.modal-container');

    if (modalContainer) {
        console.log("Une modale est déjà ouverte");
        return; // Sortir de la fonction si une modale est déjà ouverte
    }

    var userId = localStorage.getItem('userId');
    var token = localStorage.getItem('token');

    const backgroundModal = document.createElement('div');
    backgroundModal.classList.add('background-modal');

    // Création de la modale
    modalContainer = document.createElement('div');
    modalContainer.classList.add('modal-container'); 

    const modal = document.createElement('div');
    modal.classList.add('custom-modal');

    // Fonction pour ajouter les éléments récupérés à la modale existante
    function addElementsToModal(data) {
        data.forEach(work => {
            const workContainer = document.createElement('div');
            workContainer.classList.add('work-container');

            const workImage = document.createElement('img');
            workImage.src = work.imageUrl;
            workImage.alt = work.title;
            workImage.classList.add('work-image');

            const workTitle = document.createElement('h3');
            workTitle.textContent = work.title;

            const workCategory = document.createElement('p');
            workCategory.textContent = `Catégorie: ${work.category.name}`;

            workContainer.appendChild(workImage);
            workContainer.appendChild(workTitle);
            workContainer.appendChild(workCategory);

            modal.appendChild(workContainer);
        });
    }

    // Fonction pour récupérer les données des works et les afficher dans la modale
    function fetchAndAddWorksToModal() {
        fetch('http://localhost:5678/api/works', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur de récupération des données.');
            }
            return response.json();
        })
        .then(data => {
            localStorage.setItem('projectIds', JSON.stringify(data.map(project => project.id)));

            // Ajouter les éléments récupérés à la modale
            addElementsToModal(data);
        })
        .catch(error => {
            console.error('Une erreur s\'est produite lors de la récupération des données :', error);
        });
    }

    // Appel API pour récupérer les images des projets
    fetchAndAddWorksToModal();

    // Ajouter un bouton "Ajouter une photo"
    const addProjetButton = document.createElement('button');
    addProjetButton.textContent = 'Ajouter un projet';
    addProjetButton.classList.add('add-photo-button');

    // Ajouter un écouteur d'événements pour changer l'affichage de la modale
    addProjetButton.addEventListener('click', (event) => {
        event.stopPropagation(); // Empêcher la propagation de l'événement au conteneur de la modale, ce qui empêche la fermeture de la modale
        console.log("Changement d'affichage pour ajouter une photo");

        // Effacer le contenu existant de la modale
        modal.innerHTML = '';

        // Créer le formulaire pour ajouter un nouveau projet
        const form = document.createElement('form');
        form.classList.add('add-project-form');

        // Champ pour l'URL de l'image
        const imageUrlInput = document.createElement('input');
        imageUrlInput.setAttribute('type', 'text');
        imageUrlInput.setAttribute('placeholder', 'URL de l\'image');
        imageUrlInput.setAttribute('name', 'imageUrl');

        // Champ pour le titre du projet
        const titleInput = document.createElement('input');
        titleInput.setAttribute('type', 'text');
        titleInput.setAttribute('placeholder', 'Titre du projet');
        titleInput.setAttribute('name', 'title');

        // Champ pour la catégorie du projet
        const categoryInput = document.createElement('input');
        categoryInput.setAttribute('type', 'text');
        categoryInput.setAttribute('placeholder', 'Catégorie du projet');
        categoryInput.setAttribute('name', 'category');

        // Bouton de soumission du formulaire
        const submitButton = document.createElement('button');
        submitButton.setAttribute('type', 'submit');
        submitButton.textContent = 'Ajouter';

        // Ajouter les éléments au formulaire
        form.appendChild(imageUrlInput);
        form.appendChild(titleInput);
        form.appendChild(categoryInput);
        form.appendChild(submitButton);

        // Ajouter le formulaire à la modale
        modal.appendChild(form);

        // Ajouter un gestionnaire d'événements pour la soumission du formulaire
        form.addEventListener('submit', (event) => {
            event.preventDefault();

            const formData = new FormData(form);
            const imageUrl = formData.get('imageUrl');
            const title = formData.get('title');
            const category = formData.get('category');

            // Appel API pour ajouter le nouveau projet
            addProject(imageUrl, title, category);
        });

         // Empêcher la propagation de l'événement de clic pour les inputs
    imageUrlInput.addEventListener('click', (event) => {
        event.stopPropagation();
    });

    titleInput.addEventListener('click', (event) => {
        event.stopPropagation();
    });

    categoryInput.addEventListener('click', (event) => {
        event.stopPropagation();
    });

    });

    // Ajouter le bouton "Ajouter une photo" à la modale
    modal.appendChild(addProjetButton);

    // Ajouter un bouton de fermeture de la modale
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Fermer'; // Texte du bouton
    closeButton.classList.add('close-button'); // Classe CSS pour le style

    // Ajouter un gestionnaire d'événements pour fermer la modale lorsque le bouton est cliqué
    closeButton.addEventListener('click', closeModal);

    // Ajouter le bouton à la modale
    modal.appendChild(closeButton);

    // Ajouter la modale au corps du document
    modalContainer.appendChild(modal);
    document.body.appendChild(backgroundModal);
    document.body.appendChild(modalContainer);
    backgroundModal.addEventListener('click', closeModal);
    modalContainer.addEventListener('click', closeModal);
}

// Appel de la fonction d'initialisation au chargement de la page
window.addEventListener('load', initializeApp);

// Fonction d'initialisation de l'application
function initializeApp() {
    var isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    updateLoginButton(isAuthenticated);

    if (isAuthenticated) {
        // Crée le bouton "Modifier" s'il n'existe pas déjà
        if (!document.querySelector('.modify-button')) {
            const modifyButton = document.createElement('button');
            modifyButton.textContent = 'Modifier';
            modifyButton.classList.add('modify-button');

            // Ajoute un écouteur d'événements pour ouvrir la modale lorsque le bouton est cliqué
            modifyButton.addEventListener('click', openModal);

            // Ajoute le bouton "Modifier" à côté de "Mes projets"
            const portfolioSection = document.getElementById('portfolio');
            const projectsTitle = portfolioSection.querySelector('h2');
            projectsTitle.insertAdjacentElement('afterend', modifyButton); //append avec le title portfolio
        }

        // Appel de openModal après l'ajout du bouton Modifier
        openModal();
    }
}

var loginButton = document.getElementById('loginButton');
var authForm = document.getElementById('authForm');

function updateLoginButton(authenticated) {
    if (authenticated) {
        loginButton.textContent ='logout';
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

window.addEventListener('load', function() {
    var isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    updateLoginButton(isAuthenticated);

    if (isAuthenticated) {
        // Crée le bouton "Modifier"
        const modifyButton = document.createElement('button');
        modifyButton.textContent = 'Modifier';
        modifyButton.classList.add('modify-button');
    
        // Ajoute un écouteur d'événements pour ouvrir la modale lorsque le bouton est cliqué
        modifyButton.addEventListener('click', openModal);
    
        // Ajoute le bouton "Modifier" à côté de "Mes projets"
        const portfolioSection = document.getElementById('portfolio');
        const projectsTitle = portfolioSection.querySelector('h2');
        projectsTitle.insertAdjacentElement('afterend', modifyButton); //append avec le title portfolio
        
        // Appel de openModal après l'ajout du bouton Modifier
        openModal();
    }
});

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

function openModal() {

    let modalContainer = document.querySelector('modal-container');

    if (modalContainer) {
        console.log("une modale est déjà ouverte");
        return; //sortir de la fonction si une modale est déjà ouverte
    }

    var userId = localStorage.getItem('userId');
    var token = localStorage.getItem('token');

    const backgroundModal = document.createElement('div');
    backgroundModal.classList.add('background-modal');    
    
    // Création de la modale
    modalContainer = document.createElement('div');
    modalContainer.classList.add('modal-container'); // la classe spécifique pour le style de la modale

    const modal = document.createElement('div');
    modal.classList.add('custom-modal');

    // Appel API pour récupérer les images des projets
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

        // Créer et afficher les éléments HTML pour chaque projet 
        data.forEach(project => {
            const projectImage = document.createElement('img');
            projectImage.src = project.imageUrl;
            projectImage.alt = project.title;
            projectImage.classList.add('project-image');

            // Créer une icône de suppression pour chaque projet avec Font Awesome
            const removeIcon = document.createElement('i');
            removeIcon.classList.add('far', 'fa-trash-alt'); // Utilise les classes de Font Awesome pour l'icône de la corbeille
            removeIcon.setAttribute('aria-hidden', 'true'); // Ajoutez un attribut pour des raisons d'accessibilité
            removeIcon.title = 'Supprimer'; // Ajoutez un titre pour l'icône (texte d'infobulle)
            removeIcon.classList.add('remove-icon');

            // Ajouter un gestionnaire d'événements pour supprimer le projet
            removeIcon.addEventListener('click', (event) => {
                event.stopPropagation(); // Empêcher la propagation de l'événement car la modale se fermait 
                removeProject(userId, token, project.id);
            });

            // Créer un conteneur pour le projet avec l'image et l'icône de suppression
            const projectContainer = document.createElement('div');
            projectContainer.classList.add('project-container');
            projectContainer.appendChild(projectImage);
            projectContainer.appendChild(removeIcon);

            // Ajouter le conteneur du projet à la modale
            modal.appendChild(projectContainer);
        });

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
    })
    .catch(error => {
        console.error('Une erreur s\'est produite lors de la récupération des données :', error);
    });
}

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
        // Si l'ajout est réussi, vous pouvez actualiser la modale pour refléter les changements
        // Par exemple, vous pouvez recharger la modale pour afficher les projets mis à jour
        closeModal();
        openModal(); // Actualiser la modale
    })
    .catch(error => {
        console.error('Une erreur s\'est produite lors de l\'ajout du projet :', error);
    });
}

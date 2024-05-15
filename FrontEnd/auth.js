var loginButton = document.getElementById('loginButton');
var authForm = document.getElementById('authForm');

function updateLoginButton(authenticated) {
    if (authenticated && loginButton) {
        loginButton.textContent = 'logout';
    } else if (loginButton) {
        loginButton.textContent = 'login';
    }
}

// Login/Logout 
function loginLogoutHandler() {
    console.log("Appel login/logout");
    if (localStorage.getItem('isAuthenticated') === 'true') {
        console.log("L'utilisateur est authentifié");
        logoutHandler();
    } else {
        console.log("L'utilisateur n'est pas authentifié, redirection ");
        window.location.href = 'auth.html';
    }
}

// fonction deconnexion
function logoutHandler() {
    console.log("Appel de la fonction logout");
    if (localStorage.getItem('isAuthenticated') === 'true') {
        console.log("L'utilisateur est authentifié, logout en cours");
        // Clear de l'état authentifié
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userId');
        localStorage.removeItem('token');
        console.log("L'utilisateur est déconnecté");
        // Update UI
        updateLoginButton(false);
        console.log("Redirection vers la page d'accueil");
        window.location.replace('index.html');
    } else {
        console.log("L'utilisateur n'est pas authentifié, authentification requise");
    }
}

// Ajout de l'event pour vérifier l'existence du bouton login
if (loginButton) {
    console.log("Ajout de l'event login au bouton");
    loginButton.addEventListener('click', loginLogoutHandler);
} else {
    console.log("Login bouton non trouvé");
}

// Event du chargement de la page d'authentification
window.addEventListener('load', function() {
    console.log("Event chargement de la page lancé");
    var isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    updateLoginButton(isAuthenticated);

    if (isAuthenticated && !document.querySelector('.modify-button')) {
        // Création du bouton "modifier"
        console.log("Création du bouton 'Modifier'");
        const modifyButton = document.createElement('button');
        modifyButton.textContent = 'Modifier';
        modifyButton.classList.add('modify-button');

        //  Ajout de l'event pour l'ouverture de la modale
        modifyButton.addEventListener('click', openModal);
        
        // Ajout du bouton à côté de "Mes projets"
        const portfolioSection = document.getElementById('portfolio');
        if (portfolioSection) {
            const projectsTitle = portfolioSection.querySelector('h2');
            if (projectsTitle) {

                projectsTitle.parentNode.style.display = 'flex';
                projectsTitle.parentNode.style.justifyContent = 'space-between';
                projectsTitle.parentNode.style.alignItems = 'center';
                projectsTitle.parentNode.style.flexWrap = 'nowrap'; 

                projectsTitle.insertAdjacentElement('afterend', modifyButton);
                console.log("'Modification du bouton modifier ok");
            } else {
                console.log("Titre projet non trouvé");
            }
        } else {
            console.log("Section Porfolio non trouvée");
        }
    }
});



// Soumission du formulaire d'authentification
if (authForm) {
    console.log("Ajout de l'event pour la soumission du auth form");
    authForm.addEventListener('submit', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Appel API authentification
        fetch('http://localhost:5678/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Identifiants incorrects');
            }
        })
        .then(data => {
            // Stockage des éléments d'authentification
            localStorage.setItem('userId', data.userId);
            localStorage.setItem('token', data.token);
            localStorage.setItem('isAuthenticated', 'true');

            updateLoginButton(true);
            console.log("L'utilisateur est authentifié, redirection page d'accueil");
            window.location.replace('index.html');
        })
        .catch(error => {
            console.log("Erreur durant l'authentification " + error.message);
            alert(error.message);
        });
    });
} else {
    console.log("Auth form non trouvé");
}

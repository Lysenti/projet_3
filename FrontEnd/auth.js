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

        if (isAuthenticated) {   //est ce qu'il vaut mieux pour le style créer un bouton dans le html ou créer de toute piece ce bouton dans le js ?///////////////

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
        }

    });

    //soumission formulaire authentification
    authForm.addEventListener('submit', (event) => {
        event.preventDefault();
    

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;



 // Appel API pour l'authentification
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









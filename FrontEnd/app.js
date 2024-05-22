document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
  });
  
  function initializeApp() {
      var isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
      updateLoginButton(isAuthenticated);
      createProjectsHeader();
      toggleModifyButton(isAuthenticated);

      if (isAuthenticated) {
        addEditModeBanner();
      }

      // Appel des categories et projets
      fetchCategories()
          .then(categories => {
              buildFilters(categories);
              displayProjects();
          })
          .catch(error => {
              console.error('Une erreur s\'est produite lors de la récupération des catégories :', error);
          });
  }
  
  function updateLoginButton(authenticated) {
      const loginButton = document.getElementById('loginButton');
      if (authenticated) {
          loginButton.textContent = 'logout';
      } else {
          loginButton.textContent = 'login';
      }
  }
  
  function toggleModifyButton(authenticated) {
      const modifyButton = document.querySelector('.modify-button');
      if (authenticated) {
          if (!modifyButton) {
              modifyButton();
          }
      } else {
          if (modifyButton) {
              modifyButton.remove();
          }
      }
  }

  function createProjectsHeader() {
    const portfolio = document.getElementById('portfolio');
    const projectsHeader = document.createElement('div');
    projectsHeader.classList.add('projects-header');

    const title = document.createElement('h2');
    title.textContent = 'Mes projets';
    projectsHeader.appendChild(title);

    portfolio.insertBefore(projectsHeader, portfolio.firstChild);
}


  

  
  function openModalButton() {
      if (!document.querySelector('.modify-button')) {
          createModifyButton();
      }
  }
  
  function fetchCategories() {
      return fetch('http://localhost:5678/api/categories')
          .then(response => {
              if (!response.ok) {
                  throw new Error('Erreur de récupération des catégories.');
              }
              return response.json();
          });
  }
  
  function buildFilters(categories) {
      const filterDiv = document.querySelector('#portfolio .filter');
      filterDiv.innerHTML = ''; // Efface les filtres existants

      var isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

     // Si l'utilisateur est authentifié, ne pas afficher les boutons de filtre
    if (isAuthenticated) {
        return;
    }

    // Fonction pour mettre à jour les classes actives des boutons
    function updateActiveButton(activeButton) {
        const buttons = filterDiv.querySelectorAll('.filter-button');
        buttons.forEach(button => {
            button.classList.remove('active');
        });
        activeButton.classList.add('active');
    }

    // Ajout du bouton "Tous" pour afficher tous les projets
    const allButton = document.createElement('button');
    allButton.classList.add('filter-button', 'active');
    allButton.textContent = 'Tous';
    allButton.addEventListener('click', () => {
        displayProjects(null);
        updateActiveButton(allButton);
    });
    filterDiv.appendChild(allButton);

    // Ajout des boutons de filtre pour chaque catégorie
    categories.forEach(category => {
        const filterButton = document.createElement('button');
        filterButton.classList.add('filter-button');
        filterButton.textContent = category.name;
        filterButton.addEventListener('click', () => {
            displayProjects(category.id);
            updateActiveButton(filterButton);
        });
        filterDiv.appendChild(filterButton);
    });
}
  
function displayProjects(categoryId = null) {
    const gallery = document.querySelector('.gallery');
    gallery.innerHTML = ''; // Efface les projets existants
    fetch('http://localhost:5678/api/works')
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur de récupération des projets.');
            }
            return response.json();
        })
        .then(data => {
            const projectsToDisplay = categoryId ?
                data.filter(project => project.category.id === categoryId) :
                data;
            projectsToDisplay.forEach(project => {
                const projectFigure = document.createElement('figure');
                projectFigure.classList.add('category');
                projectFigure.setAttribute('id', `project-${project.id}`);
                const imageElement = document.createElement('img');
                imageElement.src = project.imageUrl;
                imageElement.alt = project.title;
                projectFigure.appendChild(imageElement);
                const figcaptionElement = document.createElement('figcaption');
                figcaptionElement.textContent = project.title;
                projectFigure.appendChild(figcaptionElement);
                gallery.appendChild(projectFigure);
            });
        })
        .catch(error => {
            console.error('Une erreur s\'est produite lors de la récupération des projets :', error);
        });
}
  
    // Vérifiez si l'utilisateur est authentifié
    var authentified = localStorage.getItem('isAuthenticated') === 'true';

    // Vérifiez si l'utilisateur est authentifié
    if (authentified === true) {
        addEditModeBanner();
}

  function addEditModeBanner() {
    // Créer la bande noire
    const banner = document.createElement('div');
    banner.className = 'edit-mode-banner';

    // Créer l'icône Font Awesome
    const icon = document.createElement('i');
    icon.className = 'fa fa-pen-to-square edit-mode-icon';

    // Créer le texte
    const text = document.createElement('span');
    text.className = 'edit-mode-text';
    text.textContent = 'mode édition';

    // Ajouter l'icône et le texte à la bande
    banner.appendChild(icon);
    banner.appendChild(text);

    // Ajouter la bande en haut de la page
    document.body.prepend(banner);
}



  
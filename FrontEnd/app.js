document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
  });
  
  function initializeApp() {
      var isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
      updateLoginButton(isAuthenticated);
      toggleModifyButton(isAuthenticated);
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
      const projectsTitle = portfolioSection.querySelector('h2');
      projectsTitle.insertAdjacentElement('afterend', modifyButton);
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

      // Ajout du bouton "Tous" pour afficher tous les projets
    const allButton = document.createElement('button');
    allButton.classList.add('filter-button');
    allButton.textContent = 'Tous';
    allButton.addEventListener('click', () => {
        displayProjects(null); 
    });
    filterDiv.appendChild(allButton);

      categories.forEach(category => {
          const filterButton = document.createElement('button');
          filterButton.classList.add('filter-button');
          filterButton.textContent = category.name;
          filterButton.addEventListener('click', () => {
              displayProjects(category.id);
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
  
  
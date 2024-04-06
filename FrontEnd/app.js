fetch('http://localhost:5678/api/works')
  .then(response => {
    if (!response.ok) {
      throw new Error('Erreur de récupération des données.');
    }
    return response.json();
  })
  .then(data => {
    const gallery = document.querySelector('.gallery');
    let projects = data; // Copie des données initiales pour la manipulation

    // Traitez les données récupérées ici
    console.log(data);

    // Récupérer toutes les catégories sans répétition
    const categories = [...new Set(data.map(projet => projet.category.name))];

    // Créer la div pour les filtres
    const filterDiv = document.createElement('div');
    filterDiv.classList.add('filter');


     // Créer un bouton de réinitialisation
      const resetButton = document.createElement('button');
      resetButton.textContent = 'Tous';
      resetButton.classList.add('filter-button');
      resetButton.addEventListener('click', () => {
        displayProjects(projects);
      });
      filterDiv.appendChild(resetButton);


    // Créer des boutons filtre pour chaque catégorie
      categories.forEach(category => {
      const filterButton = document.createElement('button');
      filterButton.classList.add('filter-button')
      filterButton.textContent = category;
      filterButton.addEventListener('click', () => {
        filterByCategory(category);
      });
      filterDiv.appendChild(filterButton);
    });

    // Ajout de la div de filtre à la page
    document.querySelector('#portfolio .filter').appendChild(filterDiv);

    // Afficher tous les projets au chargement de la page
    displayProjects(projects);

    function filterByCategory(category) {
      // Afficher uniquement les projets correspondants
      const filteredProjects = projects.filter(projet => projet.category.name === category);
      displayProjects(filteredProjects);
    }

    function displayProjects(projectsToDisplay) {
      // Supprimer tous les projets actuellement affichés
      gallery.innerHTML = '';

      // Afficher les projets spécifiés
      projectsToDisplay.forEach(projet => {
        const projetFigure = document.createElement('figure');
        projetFigure.classList.add('category');

        // Créer un élément image
        const imageElement = document.createElement('img');
        imageElement.src = projet.imageUrl;
        imageElement.alt = projet.title; // ajout d'une alternative à l'image
        projetFigure.appendChild(imageElement);

        // Créer un élément légende
        const figcaptionElement = document.createElement('figcaption');
        figcaptionElement.textContent = projet.title;
        projetFigure.appendChild(figcaptionElement);

        gallery.appendChild(projetFigure);
      });
    }

  })
  .catch(error => {
    console.error('Une erreur s\'est produite :', error);
  });
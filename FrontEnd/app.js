fetch('http://localhost:5678/api/works')
  .then(response => {
    if (!response.ok) {
      throw new Error('Erreur de récupération des données.');
    }
    return response.json();
  })
  .then(data => {
    const gallery = document.getElementsByClassName('gallery')[0];
  
    // Traitez les données récupérées ici
    console.log(data);

    data.forEach(projet => {
        const projetFigure = document.createElement('figure');
    
        //Créer un élément image
        const  imageElement = document.createElement ('img');
        imageElement.src = projet.imageUrl;
        imageElement.alt = projet.title; //ajout d'une alternative à l'image
        projetFigure.appendChild(imageElement);

        //Créer un élément légende
        const figcaptionElement = document.createElement('figcaption');
        figcaptionElement.textContent = projet.title;
        projetFigure.appendChild(figcaptionElement);

        //Créer un élément pour la catégorie
        const categoryElement = document.createElement('p');
        categoryElement.textContent= `Catégorie : ${projet.category.name}`;
        projetFigure.appendChild(categoryElement);

        //Ajout de l'élement figure à l'élément conteneur
        gallery.appendChild(projetFigure);
    })

  })
  .catch(error => {
    console.error('Une erreur s\'est produite :', error);
  });

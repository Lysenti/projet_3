function openModal() {
    // Création de la modale
    const modalContainer = document.createElement('div');
    modalContainer.classList.add('modal-container'); // la classe spécifique pour le style de la modale

    const modal = document.createElement('div');
    modal.classList.add('custom-modal');

    // Appel API pour récupérer les images des projets
    fetch('http://localhost:5678/api/works')
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur de récupération des données.');
            }
            return response.json();
        })
        .then(data => {
            // Créer et afficher les éléments HTML pour chaque projet 
            data.forEach(project => {
                const projectImage = document.createElement('img');
                projectImage.src = project.imageUrl;
                projectImage.alt = project.title;

                projectImage.classList.add('project-image');

                modal.appendChild(projectImage);
            });
            modalContainer.appendChild(modal);
            document.body.appendChild(modalContainer);
            modalContainer.addEventListener('click', closeModal);


        })
        .catch(error => {
            console.error('Une erreur s\'est produite lors de la récupération des données :', error);
        });
}

const modifyButton = document.createElement('button');
modifyButton.textContent = 'Modifier';
modifyButton.classList.add('modify-button');


modifyButton.addEventListener('click', openModal);

function closeModal() {
    const modalContainer = document.querySelector('.modal-container');
    if (modalContainer) {
        modalContainer.remove();
    }
}
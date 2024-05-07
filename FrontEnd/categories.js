function fetchAndDisplayCategories() {
    const categorySelect = document.getElementById('category');

    // Vérifier si le sélecteur de catégories contient déjà des options
    if (categorySelect.children.length === 0) {
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
}
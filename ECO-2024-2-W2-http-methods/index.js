document.getElementById('fetch-button').addEventListener('click', async function () {
	const usuarios = await fetchDatausers();
	await fetchData(usuarios);
});

async function fetchData(usuarios) {
	renderLoadingState();
	try {
		const response = await fetch('http://localhost:3004/posts');
		if (!response.ok) {
			throw new Error('Network response was not ok');
		}
		const data = await response.json();
		renderData(data, usuarios);
	} catch (error) {
		renderErrorState();
	}
}

async function fetchDatausers() {
	renderLoadingState();
	try {
		const response = await fetch('http://localhost:3004/users');
		if (!response.ok) {
			throw new Error('Network response was not ok');
		}
		const data = await response.json();
		return data;
	} catch (error) {
		renderErrorState();
	}
}

document.getElementById('create-post-button').addEventListener('click', async function () {
	const userId = document.getElementById('user-id').value;
	const title = document.getElementById('post-title').value;
	const body = document.getElementById('post-body').value;

	if (userId && title && body) {
		try {
			const response = await fetch('http://localhost:3004/posts', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					userId: parseInt(userId),
					title: title,
					body: body,
				}),
			});

			if (!response.ok) {
				throw new Error('Failed to create a new post');
			}

			const newPost = await response.json(); // Obtener el nuevo post creado

			// Clear form fields
			document.getElementById('user-id').value = '';
			document.getElementById('post-title').value = '';
			document.getElementById('post-body').value = '';

			// Obtener los usuarios nuevamente
			const usuarios = await fetchDatausers();

			// Renderizar el nuevo post primero
			renderData([newPost, ...(await fetchDataFromServer())], usuarios);
		} catch (error) {
			console.error(error);
		}
	} else {
		alert('All fields are required');
	}
});

async function deletePost(postId) {
	try {
		const response = await fetch(`http://localhost:3004/posts/${postId}`, {
			method: 'DELETE',
		});

		if (!response.ok) {
			throw new Error('Failed to delete the post');
		}

		// Re-fetch data to refresh the list after deletion
		const usuarios = await fetchDatausers();
		await fetchData(usuarios);
	} catch (error) {
		console.error('Error deleting post:', error);
	}
}

function renderErrorState() {
	const container = document.getElementById('data-container');
	container.innerHTML = '';
	container.innerHTML = '<p>Failed to load data</p>';
	console.log('Failed to load data');
}

function renderLoadingState() {
	const container = document.getElementById('data-container');
	container.innerHTML = '';
	container.innerHTML = '<p>Loading...</p>';
	console.log('Loading...');
}

async function fetchDataFromServer() {
	const response = await fetch('http://localhost:3004/posts');
	return response.ok ? response.json() : [];
}

function renderData(data, usuarios) {
	const container = document.getElementById('data-container');
	container.innerHTML = '';

	if (data.length > 0) {
		data.forEach((item) => {
			const user = usuarios.find((user) => user.id === item.userId + '');
			const card = document.createElement('div');
			card.className = 'card';

			const cardContent = `
        <div class="card-header">
          <h3>${item.title}</h3>
        </div>
        <div class="card-body">
          <p><strong>ID:</strong> ${item.id}</p>
          <p><strong>User ID:</strong> ${item.userId}</p>
          <p><strong>Content:</strong> ${item.body}</p>
          <p><strong>User Name:</strong> ${user ? user.name : 'Unknown User'}</p>
          <button class="delete-button" data-id="${item.id}">Eliminar</button>
        </div>
      `;

			card.innerHTML = cardContent;
			container.appendChild(card);
		});

		// Attach event listeners to delete buttons
		const deleteButtons = document.querySelectorAll('.delete-button');
		deleteButtons.forEach((button) => {
			button.addEventListener('click', function () {
				const postId = this.getAttribute('data-id');
				deletePost(postId);
			});
		});
	} else {
		container.innerHTML = '<p>No data found</p>';
	}
}

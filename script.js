// script.js
document.addEventListener('DOMContentLoaded', () => {

  // --- LÓGICA PARA AUTENTICAÇÃO E REDIRECIONAMENTO ---
  const loginForm = document.querySelector('form');
  const emailInput = document.querySelector('input[type="email"]');
  const passwordInput = document.querySelector('input[type="password"]');

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = emailInput.value;
    const password = passwordInput.value;

    try {
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            // SUCESSO: Armazena o Token JWT e redireciona
            
            // NOVO: Salva o Token no localStorage
            localStorage.setItem('authToken', data.token); 
            // Opcional: Salva o nome do usuário para exibir na outra tela
            localStorage.setItem('userName', data.user.nome); 
            
            alert(`Bem-vindo, ${data.user.nome}!`);
            window.location.href = 'main.html';
        } else {
            // Falha: Exibe mensagem de erro
            alert(data.message || 'Erro de login. Tente novamente.');
            passwordInput.value = ''; // Limpa a senha
        }

    } catch (error) {
        console.error('Erro na comunicação com o servidor:', error);
        alert('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
    }
  });


  // --- LÓGICA PARA O EFEITO DE LUZ NO BOTÃO ---
  const loginButton = document.querySelector('.btn');

  loginButton.addEventListener('mousemove', (event) => {
    const rect = event.target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    event.target.style.setProperty('--mouse-x', `${x}px`);
    event.target.style.setProperty('--mouse-y', `${y}px`);
  });

});
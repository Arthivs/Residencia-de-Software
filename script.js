document.addEventListener('DOMContentLoaded', () => {

  // --- LÓGICA PARA REDIRECIONAR AO CLICAR EM ENTRAR ---
  const loginForm = document.querySelector('form');

  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    window.location.href = 'main.html';
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
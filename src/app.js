const menuButton = document.querySelector('[data-menu-button]');
const menu = document.querySelector('[data-mobile-menu]');
if (menuButton && menu) {
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!open));
    menu.hidden = open;
  });
}

const searchInputs = document.querySelectorAll('[data-search-input]');
searchInputs.forEach((input) => {
  const targetId = input.getAttribute('data-search-input');
  const target = document.getElementById(targetId);
  if (!target) return;
  const cards = [...target.querySelectorAll('[data-search-card]')];
  const empty = target.querySelector('[data-search-empty]');
  const filter = () => {
    const query = input.value.trim().toLowerCase();
    let visible = 0;
    cards.forEach((card) => {
      const matches = !query || card.textContent.toLowerCase().includes(query);
      card.hidden = !matches;
      if (matches) visible += 1;
    });
    if (empty) empty.hidden = visible !== 0;
  };
  input.addEventListener('input', filter);
});

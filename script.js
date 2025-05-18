function formatDateToAPI(date) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}_${month}_${year}`;
}

const today = new Date();
today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
document.getElementById('dateInput').value = today.toISOString().split('T')[0];
updateSchedule(today.toISOString().split('T')[0]);

const toggleBtn = document.getElementById('themeToggle');
const icon = document.getElementById('themeIcon');

function updateIcon(isDark) {
  icon.src = isDark ? 'sun.png' : 'moon.png';
}

// Инициализация темы при загрузке
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark');
  updateIcon(true);
  setThemeColor(true);
} else {
  updateIcon(false);
  setThemeColor(false);
}

// Переключатель темы
toggleBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  updateIcon(isDark);
  setThemeColor(isDark);
  alert('Цвет статусбара сменится после перезапуска приложения.');
});


function formatTime(timeStr) {
  return timeStr ? timeStr.slice(0, 5) : '';
}

async function fetchSchedule(group, date) {
  const formattedDate = formatDateToAPI(date);
  const apiUrl = `http://timetable.nvsuedu.ru/tm/index.php/json?&group=${group}&date=${formattedDate}`;
  const proxyUrl = `https://red-snowflake-841e.spvcxzzzz.workers.dev/?url=${encodeURIComponent(apiUrl)}`;
  const res = await fetch(proxyUrl);
  return res.json();
}

function renderLessons(containerClass, lessons, groupName) {
  const container = document.querySelector(`.${containerClass}`);
  const groupHeader = document.querySelector(`#group${groupName} h2`);

  if (!lessons.length) {
    container.innerHTML = '<i>Нет занятий</i>';
    groupHeader.innerHTML = `Группа ${groupName}`;
    return;
  }

  const date = new Date(lessons[0].DATEZAN).toLocaleDateString('ru-RU');
  groupHeader.innerHTML = `Группа ${groupName}  `;

  container.innerHTML = '';
  lessons.forEach(lesson => {
    const div = document.createElement('div');
    div.className = 'lesson';
    const timeText = `${formatTime(lesson.TIMEZAN)} – ${formatTime(lesson.TIMEZAN_END)}`;
    let typeLabel = '';
    let badgeClass = 'time-badge'; // базовый класс

    if (lesson.VID === 'Пр') {
      typeLabel = 'Практика';
      badgeClass += ' practice';
    } else if (lesson.VID === 'Зач') {
      typeLabel = 'Зачет';
      badgeClass += ' test';
    } else if (lesson.VID === 'КпЭ') {
      typeLabel = 'КпЭ';
      badgeClass += ' kpe';
    } else if (lesson.VID === 'Эк') {
      typeLabel = 'Экзамен';
      badgeClass += ' exam';
    }

    div.innerHTML = `
  <div class="lesson-time">
    <span class="${badgeClass}">${timeText} ${typeLabel ? ` ${typeLabel}` : ''}</span>
  </div>
  <div class="lesson-discipline">${lesson.DISCIPLINE}</div>
  <div class="lesson-meta">${lesson.TEACHER} | ауд. ${lesson.AUD} (${lesson.KORP})</div>
`;

    container.appendChild(div);
  });
}

async function updateSchedule(date) {
  document.querySelector('.lessons7201').innerHTML = 'Загрузка...';
  document.querySelector('.lessons7211').innerHTML = 'Загрузка...';

  try {
    const [data7201, data7211] = await Promise.all([
      fetchSchedule(7201, date),
      fetchSchedule(7211, date)
    ]);
    renderLessons('lessons7201', data7201, '7201');
    renderLessons('lessons7211', data7211, '7211');
  } catch (e) {
    document.querySelector('.lessons7201').innerHTML = 'Ошибка загрузки';
    document.querySelector('.lessons7211').innerHTML = 'Ошибка загрузки';
    console.error('Ошибка при загрузке расписания:', e);
  }
}

document.getElementById('dateInput').addEventListener('change', (e) => {
  const date = e.target.value;
  if (date) updateSchedule(date);
});

// Проверяем, что скрипт загружается
console.log('Скрипт загружен');

window.addEventListener('DOMContentLoaded', () => {
  // 1. Установка сегодняшней даты
  const dateInput = document.getElementById('dateInput');
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  dateInput.value = today.toISOString().split('T')[0];

  // 2. Обновляем расписание на сегодня
  updateSchedule(dateInput.value);

  // 3. Переключатель даты по стрелкам
  const leftArrow = document.querySelector('.left-arrow');
  const rightArrow = document.querySelector('.right-arrow');

  function changeDate(days) {
    const currentDate = new Date(dateInput.value);
    currentDate.setDate(currentDate.getDate() + days);

    const newDateStr = currentDate.toISOString().split('T')[0];
    dateInput.value = newDateStr;
    updateSchedule(newDateStr);
  }

  leftArrow.addEventListener('click', () => changeDate(-1));
  rightArrow.addEventListener('click', () => changeDate(1));

  // 4. Слушатель изменения в input
  dateInput.addEventListener('change', (e) => {
    updateSchedule(e.target.value);
  });
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('ServiceWorker зарегистрирован с областью:', registration.scope);
        })
        .catch(error => {
          console.error('Ошибка регистрации ServiceWorker:', error);
        });
  });
}

// Функция для установки цвета статусбара
function setThemeColor(isDark) {
  const metaThemeColor = document.getElementById('theme-color-meta');
  if (!metaThemeColor) return;

  if (isDark) {
    metaThemeColor.setAttribute('content', '#1e1e1e'); // тёмный цвет статусбара
  } else {
    metaThemeColor.setAttribute('content', '#ffffff'); // светлый цвет статусбара
  }
}


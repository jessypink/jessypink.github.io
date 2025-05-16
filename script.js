function formatDateToAPI(date) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}_${month}_${year}`;
}

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

lottie.loadAnimation({
  container: document.getElementById('sunMoonAnimation'), // HTML-элемент
  renderer: 'svg',
  loop: true,
  autoplay: true,
  path: 'theme.json' // путь к твоему JSON-файлу
});

const today = new Date().toISOString().split('T')[0];
document.getElementById('dateInput').value = today;
updateSchedule(today);

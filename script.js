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
    const randomIndex = Math.floor(Math.random() * 15) + 1; // 1–5
    const imageSrc = `src/emoji-${randomIndex}.png`;

    container.innerHTML = `
    <div class="no-lessons fade-in">
      <img src="${imageSrc}" alt="Нет занятий" class="no-lessons-img">
      <p>Занятий нет</p>
    </div>
  `;
    groupHeader.innerHTML = `Группа ${groupName}`;
    return;
  }



  const date = new Date(lessons[0].DATEZAN).toLocaleDateString('ru-RU');
  groupHeader.innerHTML = `Группа ${groupName}`;

  container.innerHTML = '';
  lessons.forEach((lesson, index) => {
    const div = document.createElement('div');
    div.className = 'lesson'; // Без класса show на старте

    const timeText = `${formatTime(lesson.TIMEZAN)} – ${formatTime(lesson.TIMEZAN_END)}`;
    let typeLabel = '';
    let badgeClass = 'time-badge';

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

    // Плавное появление с небольшой задержкой
    setTimeout(() => {
      div.classList.add('show');
    }, index * 100); // Поочередное появление, шаг 100мс
  });
}


async function updateSchedule(date) {
  const containers = [
    document.querySelector('.lessons7201'),
    document.querySelector('.lessons7211'),
  ];

  // Очистка и вставка "Загрузка..." с анимацией

  // Показываем спиннер
  containers.forEach(container => {
    container.innerHTML = '';
    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    container.appendChild(spinner);
  });

  try {
    const [data7201, data7211] = await Promise.all([
      fetchSchedule(7201, date),
      fetchSchedule(7211, date)
    ]);

    renderLessons('lessons7201', data7201, '7201');
    renderLessons('lessons7211', data7211, '7211');
  } catch (e) {
    containers.forEach(container => {
      container.innerHTML = '';
      const error = document.createElement('div');
      error.className = 'loading-message error';
      error.textContent = 'Ошибка загрузки';
      container.appendChild(error);
      setTimeout(() => error.classList.add('show'), 10);
    });
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
  //updateSchedule(dateInput.value);

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
    //updateSchedule(e.target.value);
  });

  const todayButton = document.getElementById('todayButton');

  if (todayButton && dateInput) {
    todayButton.addEventListener('click', () => {
      const today = new Date().toISOString().split('T')[0];
      dateInput.value = today;
      dateInput.dispatchEvent(new Event('change')); // если есть слушатель изменения даты
    });
  }
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


if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            const reg = await navigator.serviceWorker.register('/service-worker.js');

            // Принудительная проверка обновлений при запуске
            reg.update();

            reg.addEventListener('updatefound', () => {
                const newWorker = reg.installing;

                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // Отправляем команду активироваться сразу
                        newWorker.postMessage({ type: 'SKIP_WAITING' });
                    }
                });
            });

            navigator.serviceWorker.addEventListener('controllerchange', () => {
                // Показываем тост "Выполнено обновление"
                showUpdateToast(() => {
                    // Через 5100 мс обновляем страницу
                    setTimeout(() => {
                        console.log('controllerchange событие - обновляем страницу');
                        window.location.reload();
                    }, 0);
                });
            });

        } catch (error) {
            console.error('Ошибка регистрации Service Worker:', error);
        }
    });
}


function showUpdateToast(callback) {
    const toast = document.createElement('div');
    toast.className = 'update-toast';

    const message = document.createElement('div');
    message.className = 'toast-message';
    message.textContent = 'Выполнено обновление';

    const progressWrapper = document.createElement('div');
    progressWrapper.className = 'progress-ring-wrapper';

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('class', 'progress-ring');
    svg.setAttribute('width', '24');
    svg.setAttribute('height', '24');

    const radius = 10;
    const circumference = 2 * Math.PI * radius;

    const bgCircle = document.createElementNS(svgNS, 'circle');
    bgCircle.setAttribute('class', 'ring-bg');
    bgCircle.setAttribute('cx', '12');
    bgCircle.setAttribute('cy', '12');
    bgCircle.setAttribute('r', radius);

    const fgCircle = document.createElementNS(svgNS, 'circle');
    fgCircle.setAttribute('class', 'ring-progress');
    fgCircle.setAttribute('cx', '12');
    fgCircle.setAttribute('cy', '12');
    fgCircle.setAttribute('r', radius);
    fgCircle.setAttribute('stroke-dasharray', circumference);
    fgCircle.setAttribute('stroke-dashoffset', circumference);

    svg.appendChild(bgCircle);
    svg.appendChild(fgCircle);
    progressWrapper.appendChild(svg);

    // Добавляем сначала текст, потом прогресс-бар (чтобы текст был слева, прогресс — справа)
    toast.appendChild(message);
    toast.appendChild(progressWrapper);
    document.body.appendChild(toast);

    // --- остальной код анимации прогресс-бара и скрытия тоста без изменений ---
    const fullDuration = 5200;
    const progressDuration = 4600;

    let start = null;

    function animateProgress(timestamp) {
        if (!start) start = timestamp;
        const elapsed = timestamp - start;
        const progress = Math.min(elapsed / progressDuration, 1);
        const offset = circumference * (1 - progress);
        fgCircle.setAttribute('stroke-dashoffset', offset);

        if (progress < 1) {
            requestAnimationFrame(animateProgress);
        }
    }

    requestAnimationFrame(animateProgress);

    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => {
            toast.remove();
            callback?.();
        }, 300);
    }, fullDuration);
}

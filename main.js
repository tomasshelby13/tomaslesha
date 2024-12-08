const boxes = document.querySelectorAll('.animate');

function isElementFullyOutOfViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= window.innerHeight ||
        rect.bottom <= 100
    );
}

function animateOnScroll() {
    boxes.forEach((box) => {
        if (!isElementFullyOutOfViewport(box)) {
            box.style.opacity = 1;
            box.style.transform = 'translateY(0)';
        } else {
            box.style.opacity = 0;
            box.style.transform = 'translateY(20px)';
        }
    });
}

window.addEventListener('scroll', animateOnScroll);

// Modal functionality
if (!window.modalInitialized) {
    window.modalInitialized = true;
    const openModalBtns = document.querySelectorAll('.openModalBtn');
    const closeModal = document.getElementById('closeModal');
    const modalElement = document.getElementById('myModal');

    if (modalElement && openModalBtns && closeModal) {
        openModalBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Найти ближайшую форму к кнопке
                const nearestForm = btn.closest('form');
                if (nearestForm) {
                    // Получить все инпуты из основной формы
                    const mainFormInputs = nearestForm.querySelectorAll('input');
                    // Получить все инпуты из модальной формы
                    const modalForm = modalElement.querySelector('form');
                    const modalInputs = modalForm.querySelectorAll('input');

                    // Синхронизировать данные
                    mainFormInputs.forEach((input, index) => {
                        if (modalInputs[index] && input.value) {
                            modalInputs[index].value = input.value;
                        }
                    });
                }

                modalElement.style.display = 'block';
                document.body.style.overflow = 'hidden';
            });
        });

        closeModal.addEventListener('click', () => {
            modalElement.style.display = 'none';
            document.body.style.overflow = 'auto';
        });

        window.addEventListener('click', (e) => {
            if (e.target === modalElement) {
                modalElement.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });

        // Синхронизация данных между формами при вводе в модальном окне
        const modalForm = modalElement.querySelector('form');
        const modalInputs = modalForm.querySelectorAll('input');
        
        modalInputs.forEach((input, index) => {
            input.addEventListener('input', () => {
                // Найти соответствующие инпуты на основной странице
                document.querySelectorAll('form').forEach(form => {
                    if (!form.closest('.modal')) {  // Исключаем саму модальную форму
                        const mainInputs = form.querySelectorAll('input');
                        if (mainInputs[index]) {
                            mainInputs[index].value = input.value;
                        }
                    }
                });
            });
        });
    }
}

// Обработчик для кнопки бронирования в модальном окне
const bookingButton = document.querySelector('.modal .oform');
if (bookingButton) {
    bookingButton.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Проверяем валидность формы
        const modalForm = document.querySelector('.modal form');
        const inputs = modalForm.querySelectorAll('input');
        let isValid = true;

        inputs.forEach(input => {
            if (!validateInput({ target: input })) {
                isValid = false;
            }
        });

        if (isValid) {
            // Создаем и показываем уведомление
            const notification = document.createElement('div');
            notification.style.position = 'fixed';
            notification.style.top = '20px';
            notification.style.left = '50%';
            notification.style.transform = 'translateX(-50%)';
            notification.style.backgroundColor = '#4CAF50';
            notification.style.color = 'white';
            notification.style.padding = '15px 30px';
            notification.style.borderRadius = '5px';
            notification.style.zIndex = '10000';
            notification.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
            notification.textContent = 'Бронирование успешно выполнено!';

            document.body.appendChild(notification);

            // Закрываем модальное окно
            const modalElement = document.getElementById('myModal');
            if (modalElement) {
                modalElement.style.display = 'none';
                document.body.style.overflow = 'auto';
            }

            // Очищаем формы
            document.querySelectorAll('form').forEach(form => {
                form.reset();
            });

            // Удаляем уведомление через 3 секунды
            setTimeout(() => {
                notification.style.opacity = '0';
                notification.style.transition = 'opacity 0.5s ease';
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 500);
            }, 3000);
        }
    });
}

// Form validation
const forms = document.querySelectorAll('form');

forms.forEach(form => {
    const inputs = form.querySelectorAll('input');
    
    inputs.forEach(input => {
        input.addEventListener('input', validateInput);
        input.addEventListener('blur', validateInput);
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        let isValid = true;

        inputs.forEach(input => {
            if (!validateInput({ target: input })) {
                isValid = false;
            }
        });

        if (isValid) {
            // Here you would typically send the form data to a server
            const formData = new FormData(form);
            alert('Форма успешно отправлена!');
            form.reset();
            const modalElement = document.getElementById('myModal');
            if (modalElement) {
                modalElement.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        }
    });
});

function validateInput(e) {
    const input = e.target;
    const value = input.value.trim();
    let isValid = true;
    let errorMessage = '';

    // Remove any existing error message
    const existingError = input.nextElementSibling;
    if (existingError && existingError.className === 'error-message') {
        existingError.remove();
    }

    // Validate based on placeholder
    if (value === '') {
        isValid = false;
        errorMessage = 'Это поле обязательно для заполнения';
    } else if (input.placeholder.includes('телефон')) {
        const phoneRegex = /^(\+7|7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/;
        if (!phoneRegex.test(value)) {
            isValid = false;
            errorMessage = 'Введите корректный номер телефона';
        }
    } else if (input.placeholder.includes('имя')) {
        const nameRegex = /^[а-яА-ЯёЁa-zA-Z\s]{2,30}$/;
        if (!nameRegex.test(value)) {
            isValid = false;
            errorMessage = 'Имя должно содержать от 2 до 30 букв';
        }
    }

    // Add error message if validation failed
    if (!isValid) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.color = 'red';
        errorDiv.style.fontSize = '12px';
        errorDiv.style.marginTop = '5px';
        errorDiv.textContent = errorMessage;
        input.parentNode.insertBefore(errorDiv, input.nextSibling);
        input.style.borderColor = 'red';
    } else {
        input.style.borderColor = '#ccc';
    }

    return isValid;
}

// Calculate total price
const checkboxes = document.querySelectorAll('.checkbox-label input[type="checkbox"]');
const totalPriceElement = document.querySelector('.itogo');
const basePrice = 2490;

function updateTotalPrice() {
    let additionalPrice = 0;
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            const priceText = checkbox.parentElement.textContent.match(/\((\d+)\s*руб\)/);
            if (priceText && priceText[1]) {
                additionalPrice += parseInt(priceText[1]);
            }
        }
    });
    if (totalPriceElement) {
        totalPriceElement.textContent = `Итого: ${basePrice + additionalPrice} руб.`;
    }
}

checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', updateTotalPrice);
});

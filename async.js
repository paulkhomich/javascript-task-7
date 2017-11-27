'use strict';

exports.isStar = true;
exports.runParallel = runParallel;

/** Функция паралелльно запускает указанное число промисов
 * @param {Array} jobs – функции, которые возвращают промисы
 * @param {Number} parallelNum - число одновременно исполняющихся промисов
 * @param {Number} timeout - таймаут работы промиса
 */

function runParallel(jobs, parallelNum, timeout = 1000) {
    return new Promise((resolve) => {
        if (jobs.length === 0) { // Проверяю пустой jobs
            resolve([]);
        }
        let result = [];
        let index = 0; // Индекс в jobs - для запуска нужного jobs[index]
        let fullCounter = 0; // Контроль заполнения result

        let runTranslate = async function (job) {
            let endOfTime = function () { // Функция вызова следующего промиса и контроля
                fullCounter += 1;           // выполнения всех
                if (index < jobs.length) {
                    runTranslate(jobs[index]);
                }
                if (fullCounter === jobs.length) {
                    resolve(result);
                }
            };

            let timer = setTimeout(function () { // Запускаем счетчик допустимого времени
                throw new Error('Promise timeout');
            }, timeout);

            try {
                index += 1; // Сдвигаю индекс вызываемого следующим при запуске нового промиса
                let a = await job(); // Жду ответа
                clearTimeout(timer); // Сбрасываем таймер, тк все хорошо
                result[jobs.indexOf(job)] = a; // Под нужным индексом(порядок в jobs) записываю
                endOfTime();
            } catch (err) {
                result[jobs.indexOf(job)] = err;
                clearTimeout(timer); // Сбрасываем таймер, тк уже все плохо
                endOfTime();
            }
        };

        jobs.slice(0, parallelNum).forEach(job => runTranslate(job)); // Делаю "параллел. потоки"
    });
}

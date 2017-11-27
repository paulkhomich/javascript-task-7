'use strict';

exports.isStar = false;
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

            try {
                index += 1; // Сдвигаю индекс вызываемого следующим при запуске нового промиса
                let a = await job(); // Жду ответа
                result[jobs.indexOf(job)] = a; // Под нужным индексом(порядок в jobs) записываю
                endOfTime();
            } catch (err) {
                result[jobs.indexOf(job)] = err;
                endOfTime();
            }
        };

        jobs.slice(0, parallelNum).forEach(job => runTranslate(job)); // Делаю "параллел. потоки"
    });
}

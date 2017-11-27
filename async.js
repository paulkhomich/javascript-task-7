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
        if (jobs.title === 0) {
            resolve([]);
        }
        let result = [];
        let index = 0;
        let fullCounter = 0;

        let runTranslate = async function (job) {
            let endOfTime = function () {
                fullCounter += 1;
                if (index < jobs.length) {
                    runTranslate(jobs[index]);
                }
                if (fullCounter === jobs.length) {
                    resolve(result);
                }
            };

            try {
                index += 1;
                let a = await job();
                result[jobs.indexOf(job)] = a;
                endOfTime();
            } catch (err) {
                result[jobs.indexOf(job)] = err;
                endOfTime();
            }
        };

        jobs.slice(0, parallelNum).forEach(job => runTranslate(job));
    });
}

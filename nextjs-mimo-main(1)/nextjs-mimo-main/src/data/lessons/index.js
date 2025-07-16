// src/data/lessons/index.js
import lesson1_1 from './module1/lesson1'
import lesson1_2 from './module1/lesson2'
import lesson1_3 from './module1/lesson3'
import lesson2_1 from './module2/lesson1'
import lesson2_2 from './module2/lesson2'
import lesson2_3 from './module2/lesson3'
import lesson3_1 from './module3/lesson1'
import lesson3_2 from './module3/lesson2'
import lesson3_3 from './module3/lesson3'
import lesson4_1 from './module4/lesson1'
import lesson4_2 from './module4/lesson2'
import lesson4_3 from './module4/lesson3'
import lesson5_1 from './module5/lesson1'
import lesson5_2 from './module5/lesson2'
import lesson5_3 from './module5/lesson3'
import lesson5_4 from './module5/lesson4'
import lesson6_1 from './module6/lesson1'
import lesson6_2 from './module6/lesson2'
import lesson6_3 from './module6/lesson3'
import lesson7_1 from './module7/lesson1'
import lesson7_2 from './module7/lesson2'
import lesson7_3 from './module7/lesson3'
import lesson8_1 from './module8/lesson1'
import lesson8_2 from './module8/lesson2'
import lesson8_3 from './module8/lesson3'
import lesson8_4 from './module8/lesson4'
import lesson9_1 from './module9/lesson1'
import lesson9_2 from './module9/lesson2'
import lesson9_3 from './module9/lesson3'
import lesson10_1 from './module10/lesson1'
import lesson10_2 from './module10/lesson2'
import lesson10_3 from './module10/lesson3'
import lesson11_1 from './module11/lesson1'
import lesson11_2 from './module11/lesson2'
import lesson11_3 from './module11/lesson3'
import lesson12_1 from './module12/lesson1'
import lesson12_2 from './module12/lesson2'
import lesson12_3 from './module12/lesson3'
import lesson13_1 from './module13/lesson1'
import lesson13_2 from './module13/lesson2'
import lesson13_3 from './module13/lesson3'
import lesson14_1 from './module14/lesson1'
import lesson14_2 from './module14/lesson2'
import lesson14_3 from './module14/lesson3'
import lesson15_1 from './module15/lesson1'
import lesson15_2 from './module15/lesson2'
import lesson15_3 from './module15/lesson3'
import lesson16_1 from './module16/lesson1'
import lesson16_2 from './module16/lesson2'
import lesson16_3 from './module16/lesson3'

export const LESSONS = {
  '1-1': lesson1_1,
  '1-2': lesson1_2,
  '1-3': lesson1_3,
  '2-1': lesson2_1,
  '2-2': lesson2_2,
  '2-3': lesson2_3,
  '3-1': lesson3_1,
  '3-2': lesson3_2,
  '3-3': lesson3_3,
  '4-1': lesson4_1,
  '4-2': lesson4_2,
  '4-3': lesson4_3,
  '5-1': lesson5_1,
  '5-2': lesson5_2,
  '5-3': lesson5_3,
  '5-4': lesson5_4,
  '6-1': lesson6_1,
  '6-2': lesson6_2,
  '6-3': lesson6_3,
  '7-1': lesson7_1,
  '7-2': lesson7_2,
  '7-3': lesson7_3,
  '8-1': lesson8_1,
  '8-2': lesson8_2,
  '8-3': lesson8_3,
  '8-4': lesson8_4,
  '9-1': lesson9_1,
  '9-2': lesson9_2,
  '9-3': lesson9_3,
  '10-1': lesson10_1,
  '10-2': lesson10_2,
  '10-3': lesson10_3,
  '11-1': lesson11_1,
  '11-2': lesson11_2,
  '11-3': lesson11_3,
  '12-1': lesson12_1,
  '12-2': lesson12_2,
  '12-3': lesson12_3,
  '13-1': lesson13_1,
  '13-2': lesson13_2,
  '13-3': lesson13_3,
  '14-1': lesson14_1,
  '14-2': lesson14_2,
  '14-3': lesson14_3,
  '15-1': lesson15_1,
  '15-2': lesson15_2,
  '15-3': lesson15_3,
  '16-1': lesson16_1,
  '16-2': lesson16_2,
  '16-3': lesson16_3
}

export function getLesson (moduleId, lessonId) {
  const key = `${moduleId}-${lessonId}`
  return LESSONS[key] || null
}

export function getModuleLessons (moduleId) {
  return Object.values(LESSONS)
    .filter(lesson => lesson?.id && lesson.id.startsWith(`${moduleId}-`))
    .sort((a, b) => {
      const idA = a?.id || ''
      const idB = b?.id || ''
      return idA.localeCompare(idB)
    })
}

export function getAllLessons () {
  return Object.values(LESSONS)
    .filter(lesson => lesson?.id) // Filter out lessons without IDs
    .sort((a, b) => {
      const idA = a?.id || ''
      const idB = b?.id || ''
      return idA.localeCompare(idB)
    })
}

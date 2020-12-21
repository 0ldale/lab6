import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    grades: []
  },
  mutations: {
    addGrade: (state, data) => {
      state.grades.push({
        course_name: data.course_name,
        grade: data.grade
      })
    },
    deleteGrade: (state, data) => {
      state.grades.forEach((ele, idx) => {
        if (ele.course_name === data.course_name && ele.grade === data.grade) {
          state.grades.splice(idx, 1)
        }
      })
    },
    /** Update the item at the selected row */
    saveGrade: (state, data) => {
      let updatedItem = state.grades[data.row]
      updatedItem.course_name = data.course_name
      updatedItem.grade = data.grade
    }
  },
  actions: {
    /** Check if the course thats trying to be created already exists
     * This is a little confusing, but return True if exists, and do not add
     * Otherwise return False since it DOESN'T exist, and push it to the table
     */
    checkCourse: (state, data) => {
      let duplicate = state.state.grades.some((item, idx) => {
        if (item.course_name === data.course_name) {
          return true
        } else {
          return false
        }
      })
      return new Promise((resolve, reject) => {
        if (duplicate) {
          // send true, it is a duplicate and we DONT WANT IT
          resolve(true)
        } else {
          // send false, it is a new course we DO WANT IT
          resolve(false)
        }
      })
    }
  },
  getters: {
    all: (state) => {
      return state.grades
    },
    /** Get the classes with an honour worthy grade */
    honours: (state) => {
      let honourGrades = []
      state.grades.forEach((item, idx) => {
        if (item.grade >= 80) {
          honourGrades.push(item)
        }
      })
      return honourGrades
    },
    /** Get the classes that were failed */
    failed: (state) => {
      let failedGrades = []
      state.grades.forEach((item, idx) => {
        if (item.grade < 50) {
          failedGrades.push(item)
        }
      })
      return failedGrades
    },
    /** Grab the grades, sort by ascending, and return the lowest */
    minimum: (state) => {
      let gradesArr = []
      state.grades.forEach((item, idx) => {
        gradesArr.push(item.grade)
      })
      gradesArr.sort(function (a, b) { return a - b })
      return gradesArr[0]
    },
    /** Grab the grades, sort by descending, and grab the highest */
    maximum: (state) => {
      let gradesArr = []
      state.grades.forEach((item, idx) => {
        gradesArr.push(item.grade)
      })
      gradesArr.sort(function (a, b) { return b - a })
      return gradesArr[0]
    },
    /** Grab the grades, add them up, and return the value of the sum / total */
    average: (state) => {
      let avg = 0
      state.grades.forEach((item, idx) => {
        avg += item.grade
      })
      return (avg / state.grades.length).toFixed(2)
    }
  }
})

export default store

<template>
  <div>
    <div :class="['application', {modal: modalOpen}]">
      <div class="grid-y grid-padding-x grid-padding-y">
        <div class="actions cell small-2 grid-x grid-padding-x grid-padding-y">
          <div class="cell small-1">
            <div class="toggle-button toggle-button-honour">
              <ToggleButton v-model="isHonour" :sync="true" :width="80" :height="36" :color="{checked: '#44c700', unchecked: '#d3d3d3'}" :labels="{checked: 'Honour', unchecked: 'Honour'}" />
            </div>
          </div>
          <div class="cell small-1">
            <div class="toggle-button toggle-button-failed">
              <ToggleButton v-model="isFailed" :sync="true" :width="80" :height="36" :color="{checked: '#FF0000', unchecked: '#d3d3d3'}" :labels="{checked: 'Failed', unchecked: 'Failed'}" />
            </div>
          </div>
          <div class="cell small-3 searchWrapper">
            <input type="text" v-model="searchTerms" placeholder="Search Courses" />
          </div>
          <div class="cell small-4">
            <select v-model="sortTopic" @change="onChange($event)">
              <option value="course">Course</option>
              <option value="mark">Mark</option>
            </select>
          </div>
          <div class="cell small-1">
            <div class="grid-y">
              <div class="cell small-6">
                <!-- /** SORTING THE COLUMNS ASCENDING */ -->
                <button type="button" @click.prevent="sortClicked('asc')" :enabled="sortDirection == 'asc'">
                  <img :src="iconAsc" class="sort-icon">
                </button>
              </div>
              <div class="cell small-6">
                <!-- /** SORTING THE COLUMNDS DESCENDING */ -->
                <button type="button" @click.prevent="sortClicked('desc')" :enabled="sortDirection == 'desc'">
                  <img :src="iconDesc" class="sort-icon" />
                </button>
              </div>
            </div>
          </div>
          <div class="cell small-2">
            <button type="button" @click="createGradeClicked" class="button expanded small hollow create-button">Create</button>
          </div>
        </div>

        <div class="content cell small-8 grid-x grid-padding-x grid-padding-y">
          <table class="stack">
            <thead>
              <th>Course</th>
              <th>Mark</th>
              <th></th>
            </thead>
            <tbody>
              <tr v-for="(grade, row) in filteredList" :key="grade.course_name + grade.grade * Math.random()">
                <td class="text-left" width="40%">
                  {{ grade.course_name }}
                </td>
                <td class="text-left" width="40%">
                  {{ grade.grade }}
                </td>
                <td class="action-buttons text-right">
                  <div class="action-button">
                    <button type="button" @click.prevent="gradeItemDeleteClicked(grade, row)">
                      <img :src="iconDelete" class="action-icon" />
                    </button>
                  </div>
                  <div class="action-button">
                    <button type="button" @click.prevent="gradeItemEditClicked(grade, row)">
                      <img :src="iconEdit" class="action-icon" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="results cell small-2 grid-x grid-padding-x grid-padding-y">
          <div class="cell small-4">
            <h5>Minimum</h5>
            <div>{{ minimumMark }} / 100</div>
          </div>
          <div class="cell small-4">
            <h5>Maximum</h5>
            <div>{{ maximumMark }} / 100</div>
          </div>
          <div class="cell small-4">
            <h5>Average</h5>
            <div>{{ averageMark }} / 100</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <transition name="fade">
      <div :class="['modal', 'modal-grade-edit-add', {open: modalOpen}]" v-if="modalOpen">
        <h4>{{ modalTitle }}</h4>
        <div class="grid-x grid-padding-x grid-padding-y">
          <div class="cell small-6">
            <input type="text" v-model="modalCourseValue" placeholder="Course">
          </div>
          <div class="cell small-6">
            <input type="number" v-model.number="modalGradeValue" min="0" max="100" placeholder="Grade">
          </div>
          <div class="cell small-12 messages">
            <div class="message">{{ message }}</div>
          </div>
          <div class="cell small-12">
            <button type="button" @click="cancelClicked" class="button clear small cancel-button">Cancel</button>
            <button type="button" @click="defaultActionClicked" class="button small create-button">{{ modalDefaultActionLabel }}</button>
          </div>
        </div>
        <button class="close-button" aria-label="Close modal" type="button" @click.prevent="closeModalClicked">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
    </transition>
  </div>
</template>

<script>
import Vue from 'vue'
import { ToggleButton } from 'vue-js-toggle-button'

Vue.component('ToggleButton', ToggleButton)

export default {
  name: 'Grades',
  components: {
    ToggleButton
  },
  data () {
    return {
      iconDesc: require('../assets/desc.png'),
      iconAsc: require('../assets/asc.png'),
      iconDelete: require('../assets/delete.png'),
      iconEdit: require('../assets/edit.png'),
      isHonour: false,
      isFailed: false,
      sortTopic: 'course',
      sortDirection: 'desc',
      searchTerms: '',
      modalTitle: 'Add Grade',
      modalDefaultActionLabel: 'Create',
      modalOpen: false,
      modalGradeValue: 0,
      modalCourseValue: null,
      message: null,
      activeRow: null,
      activeGrade: null,
      fakeCourses: ['Math', 'Geography', 'Art', 'Music', 'Science', 'Drama'] // We use this to add a few grades to the list for testing
    }
  },
  watch: {
    modalOpen: function (val, oldVal) {
      if (!val) {
        this.modalGradeValue = 0
        this.modalCourseValue = null
      }
    },
    isHonour: function (val, oldVal) {
      if (val) {
        this.isFailed = false
      }
    },
    isFailed: function (val, oldVal) {
      if (val) {
        this.isHonour = false
      }
    }
  },
  computed: {
    minimumMark () {
      return this.$store.getters.minimum
    },
    maximumMark () {
      return this.$store.getters.maximum
    },
    averageMark () {
      return this.$store.getters.average
    },
    grades () {
      let returnGrades = this.$store.getters.all

      /** Filter the honour/failed classes via the switches at the top */
      if (this.isHonour) {
        returnGrades = this.$store.getters.honours
      } else if (this.isFailed) {
        returnGrades = this.$store.getters.failed
      }

      return returnGrades
    },
    /** Filter courses via search bar */
    filteredList () {
      return this.grades.filter(post => {
        return post.course_name.toLowerCase().includes(this.searchTerms.toLowerCase())
      })
    }
  },
  methods: {
    /** Update the sort topic when dropdown value is changed */
    onChange (event) {
      this.sortTopic = event.target.value
      console.log(this.sortTopic)
    },
    createGradeClicked () {
      this.modalTitle = 'Add Grade'
      this.modalDefaultActionLabel = 'Create'
      this.modalOpen = true
    },
    gradeItemDeleteClicked (grade, row) {
      if (!confirm('Are you sure you would like to delete this grade?')) return

      this.$store.commit('deleteGrade', {
        course_name: grade.course_name,
        grade: grade.grade,
        row: this.activeRow
      })
    },
    gradeItemEditClicked (grade, row) {
      this.activeRow = row
      this.activeGrade = grade

      this.modalTitle = 'Edit Grade'
      this.modalDefaultActionLabel = 'Save'
      this.modalCourseValue = grade.course_name
      this.modalGradeValue = grade.grade
      this.modalOpen = true
    },
    /** Sort the table according to the chosen topic/order */
    sortClicked (direction) {
      let dir = direction
      let topic = this.sortTopic
      function compare (a, b) {
        switch (topic) {
          /** SORT BY COURSE */
          case 'course':
            if (dir === 'asc') {
              /** ASCENDING */
              if (a.course_name < b.course_name) {
                return -1
              }
              if (a.course_name > b.course_name) {
                return 1
              }
              return 0
            } else {
              /** DESCENDING */
              if (a.course_name < b.course_name) {
                return 1
              }
              if (a.course_name > b.course_name) {
                return -1
              }
              return 0
            }
          /** SORT BY GRADE */
          case 'mark':
            if (dir === 'asc') {
              /** ASCENDING */
              if (a.grade < b.grade) {
                return -1
              }
              if (a.grade > b.grade) {
                return 1
              }
              return 0
            } else {
              /** DESCENDING */
              if (a.grade < b.grade) {
                return 1
              }
              if (a.grade > b.grade) {
                return -1
              }
              return 0
            }
        }
      }
      return this.$store.getters.all.sort(compare)
    },
    closeModalClicked () {
      this.modalOpen = false
    },
    /** Update or Create a new course */
    defaultActionClicked () {
      this.message = ''
      if (this.modalDefaultActionLabel === 'Save') {
        /** LOGIC FOR UPDATING A COURSE */
        if (this.modalCourseValue && this.modalGradeValue) {
          this.$store.commit('saveGrade', {
            course_name: this.modalCourseValue,
            grade: this.modalGradeValue,
            row: this.activeRow
          })
          this.modalOpen = false
          return this.$store.grades
        } else {
          this.message = 'Please enter both Course and Grade'
        }
      } else {
        if (this.activeRow) {
          this.$store.commit('saveGrade', {
            course_name: this.modalCourseValue,
            grade: this.modalGradeValue,
            row: this.activeRow
          })
        } else {
          /** LOGIC FOR ADDING A COURSE */
          if (this.modalCourseValue && this.modalGradeValue) {
            /** Check if the course being added is a duplicate */
            this.$store.dispatch('checkCourse', {course_name: this.modalCourseValue}).then((canAdd) => {
              console.log('here ' + canAdd)
              if (canAdd) {
                // It was true, which means it was a duplicate.
                console.log('REJECTED. We dont accept duplicated courses')
                this.message = 'This course already exists'
              } else {
                // It was false, which means it doesn't exist yet.
                this.$store.commit('addGrade', {
                  course_name: this.modalCourseValue,
                  grade: this.modalGradeValue
                })
                this.modalOpen = false
              }
            })
          } else {
            this.message = 'Please enter both Course and Grade.'
          }
        }
      }
    },
    cancelClicked () {
      this.message = ''
      this.closeModalClicked()
    }
  },
  mounted () {
    // We use this to add a few grades to the list for testing
    for (let x = 0; x < 20; x++) {
      let randomCourse = this.fakeCourses[(Math.floor(Math.random() * (this.fakeCourses.length - 0)) + 0)]
      let randomGrade = Math.floor(Math.random() * (100 - 0 + 1)) + 0
      this.$store.commit('addGrade', {
        course_name: randomCourse,
        grade: randomGrade
      })
    }
  }
}
</script>

<style scoped>
button,
input {
  outline: none;
}

input[type=search],
select {
  border-radius: 5px;
}

button[type=button]:disabled {
  opacity: 0.3;
}

.application {
  filter: blur(0px);
  transition: filter 0.3s ease-in-out;
}

.application.modal {
  filter: blur(2px);
}

.search-text {
  background: url('~@/assets/search.png') center right no-repeat;
  background-size: contain;
}

.create-button {
  border-radius: 40px;
  padding-left: 20px;
  padding-right: 20px;
}

table.stack {
  width: 90%;
  margin: auto;
}

.action-icon,
.sort-icon {
  width: 20px;
  height: 20px;
}

.action-buttons {
  position: relative;
}

.action-button {
  display: inline;
}

.messages {
  padding-top: 0;
  padding-bottom: 0;
}

.message {
  background: #e3e3e3;
  border-radius: 4px;
}

.modal.modal-grade-edit-add {
  display: none;
  position: absolute;
  background: white;
  top: 50%;
  left: 50%;
  margin-left: -350px;
  margin-top: -175px;
  width: 700px;
  height: 270px;
  border: 2px solid rgba(0, 0, 0, 0.2);
  padding: 30px;
  box-shadow: -5px 5px 10px 0 rgba(0,0,0,0.05);
  border-radius: 10px;
}

.modal.modal-grade-edit-add.open {
  display: block;
}

.modal.modal-grade-edit-add .close-button {
  position: absolute;
  right: 10px;
  top: 10px;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}

.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>

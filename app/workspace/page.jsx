import React from 'react'
import WelcomeBanner from './_components/WelcomeBanner'
import CourseList from './_components/CourseList'
import EnrollCourseList from './_components/EnrollCourseList'

function Workspace() {
  return (
    <div className="space-y-8">
      <WelcomeBanner />
      <EnrollCourseList />
      <CourseList />
    </div>
  )
}

export default Workspace

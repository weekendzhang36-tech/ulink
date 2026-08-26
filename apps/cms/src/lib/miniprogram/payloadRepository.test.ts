import assert from 'node:assert/strict'
import test from 'node:test'

import { createPayloadRepository } from './payloadRepository.ts'

test('returns campus display names for instructor student summaries', async () => {
  const findCalls: Record<string, unknown>[] = []
  const repository = createPayloadRepository({
    async create() {
      throw new Error('not used')
    },
    async delete() {
      throw new Error('not used')
    },
    async find(input) {
      findCalls.push(input)

      return {
        docs: [
          {
            class: { id: 'class_001', name: '金融学 2026-1 班' },
            college: { id: 'college_001', name: '金融学院' },
            id: 'student_001',
            major: { id: 'major_001', name: '金融学' },
            phone: '13800000001',
            realName: '林一诺',
            school: { id: 'school_001', name: '广东金融学院' },
            submittedAt: '2026-08-26T09:00:00.000Z',
            verificationStatus: 'pending',
          },
        ],
      }
    },
    async findByID() {
      throw new Error('not used')
    },
    async update() {
      throw new Error('not used')
    },
  })

  const students = await repository.findStudentsByClassIds({
    classIds: ['class_001'],
    status: 'pending',
  })

  assert.equal(findCalls[0].depth, 1)
  assert.deepEqual(students, [
    {
      classId: 'class_001',
      className: '金融学 2026-1 班',
      collegeId: 'college_001',
      collegeName: '金融学院',
      id: 'student_001',
      majorId: 'major_001',
      majorName: '金融学',
      phone: '13800000001',
      realName: '林一诺',
      schoolId: 'school_001',
      schoolName: '广东金融学院',
      submittedAt: '2026-08-26T09:00:00.000Z',
      verificationStatus: 'pending',
    },
  ])
})

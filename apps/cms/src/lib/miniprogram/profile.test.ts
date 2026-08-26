import assert from 'node:assert/strict'
import test from 'node:test'

import { createPhoneVerificationToken } from './phone.ts'
import { createSessionToken } from './session.ts'
import { getStudentProfileForEdit, submitStudentProfile } from './profile.ts'
import { createMemoryRepository } from './testing/memoryRepository.ts'

const secret = 'test-secret'

function tokenFor(openId: string, studentId?: string) {
  return createSessionToken({
    expiresInSeconds: 60 * 60,
    now: new Date('2026-08-26T10:00:00.000Z'),
    openId,
    secret,
    studentId,
  })
}

test('creates a pending student only after a complete profile is submitted', async () => {
  const repository = createMemoryRepository({ seedStudents: false })

  const result = await submitStudentProfile({
    input: {
      agreedToPolicies: true,
      birthday: '2007-09-01',
      classId: 'class_001',
      collegeId: 'college_001',
      gender: 'female',
      majorId: 'major_001',
      phone: '13800000001',
      phoneVerificationToken: createPhoneVerificationToken({
        expiresInSeconds: 60 * 10,
        now: new Date('2026-08-26T10:00:00.000Z'),
        phone: '13800000001',
        secret,
      }),
      realName: '林一诺',
      schoolId: 'school_001',
      sessionToken: tokenFor('openid_001'),
    },
    now: new Date('2026-08-26T10:01:00.000Z'),
    repository,
    secret,
  })

  assert.equal(result.student.realName, '林一诺')
  assert.equal(result.student.verificationStatus, 'pending')
  assert.equal(repository.students.size, 1)
})

test('does not persist a student when required profile fields are missing', async () => {
  const repository = createMemoryRepository({ seedStudents: false })

  await assert.rejects(
    () =>
      submitStudentProfile({
        input: {
          agreedToPolicies: true,
          birthday: '2007-09-01',
          classId: 'class_001',
          collegeId: 'college_001',
          gender: 'female',
          majorId: 'major_001',
          phone: '13800000001',
          phoneVerificationToken: createPhoneVerificationToken({
            expiresInSeconds: 60 * 10,
            now: new Date('2026-08-26T10:00:00.000Z'),
            phone: '13800000001',
            secret,
          }),
          realName: '',
          schoolId: 'school_001',
          sessionToken: tokenFor('openid_001'),
        },
        now: new Date('2026-08-26T10:01:00.000Z'),
        repository,
        secret,
      }),
    /真实姓名/,
  )

  assert.equal(repository.students.size, 0)
})

test('rejects profile submission when campus selection is not an active backend hierarchy', async () => {
  const repository = createMemoryRepository({ seedStudents: false })

  await assert.rejects(
    () =>
      submitStudentProfile({
        input: {
          agreedToPolicies: true,
          birthday: '2007-09-01',
          classId: 'class_missing',
          collegeId: 'college_001',
          gender: 'female',
          majorId: 'major_001',
          phone: '13800000001',
          phoneVerificationToken: createPhoneVerificationToken({
            expiresInSeconds: 60 * 10,
            now: new Date('2026-08-26T10:00:00.000Z'),
            phone: '13800000001',
            secret,
          }),
          realName: '林一诺',
          schoolId: 'school_001',
          sessionToken: tokenFor('openid_001'),
        },
        now: new Date('2026-08-26T10:01:00.000Z'),
        repository,
        secret,
      }),
    /学校、学院、专业或班级不可用/,
  )

  assert.equal(repository.students.size, 0)
})

test('rejects a phone number already bound to another WeChat identity', async () => {
  const repository = createMemoryRepository({ seedStudents: false })
  repository.students.set('student_existing', {
    birthday: '2007-09-01',
    classId: 'class_001',
    collegeId: 'college_001',
    gender: 'female',
    id: 'student_existing',
    majorId: 'major_001',
    phone: '13800000001',
    realName: '已注册学生',
    schoolId: 'school_001',
    submittedAt: '2026-08-26T09:00:00.000Z',
    verificationStatus: 'pending',
    wechatOpenId: 'openid_existing',
  })

  await assert.rejects(
    () =>
      submitStudentProfile({
        input: {
          agreedToPolicies: true,
          birthday: '2007-09-01',
          classId: 'class_001',
          collegeId: 'college_001',
          gender: 'female',
          majorId: 'major_001',
          phone: '13800000001',
          phoneVerificationToken: createPhoneVerificationToken({
            expiresInSeconds: 60 * 10,
            now: new Date('2026-08-26T10:00:00.000Z'),
            phone: '13800000001',
            secret,
          }),
          realName: '林一诺',
          schoolId: 'school_001',
          sessionToken: tokenFor('openid_001'),
        },
        now: new Date('2026-08-26T10:01:00.000Z'),
        repository,
        secret,
      }),
    /手机号已绑定/,
  )

  assert.equal(repository.students.size, 1)
})

test('rejects profile submission when the phone verification token does not match the phone', async () => {
  const repository = createMemoryRepository({ seedStudents: false })

  await assert.rejects(
    () =>
      submitStudentProfile({
        input: {
          agreedToPolicies: true,
          birthday: '2007-09-01',
          classId: 'class_001',
          collegeId: 'college_001',
          gender: 'female',
          majorId: 'major_001',
          phone: '13800000001',
          phoneVerificationToken: createPhoneVerificationToken({
            expiresInSeconds: 60 * 10,
            now: new Date('2026-08-26T10:00:00.000Z'),
            phone: '13800000002',
            secret,
          }),
          realName: '林一诺',
          schoolId: 'school_001',
          sessionToken: tokenFor('openid_001'),
        },
        now: new Date('2026-08-26T10:01:00.000Z'),
        repository,
        secret,
      }),
    /手机号验证不匹配/,
  )

  assert.equal(repository.students.size, 0)
})

test('moves a needs-review student back to pending after resubmitting a complete profile', async () => {
  const repository = createMemoryRepository({ seedStudents: false })
  repository.students.set('student_needs_review', {
    birthday: '2007-09-01',
    classId: 'class_001',
    collegeId: 'college_001',
    gender: 'female',
    id: 'student_needs_review',
    majorId: 'major_001',
    phone: '13800000001',
    realName: '林一诺',
    schoolId: 'school_001',
    submittedAt: '2026-08-26T09:00:00.000Z',
    verificationStatus: 'needs_review',
    wechatOpenId: 'openid_001',
  })

  const result = await submitStudentProfile({
    input: {
      agreedToPolicies: true,
      birthday: '2007-09-01',
      classId: 'class_001',
      collegeId: 'college_001',
      gender: 'female',
      majorId: 'major_001',
      phone: '13800000001',
      phoneVerificationToken: createPhoneVerificationToken({
        expiresInSeconds: 60 * 10,
        now: new Date('2026-08-26T10:00:00.000Z'),
        phone: '13800000001',
        secret,
      }),
      realName: '林一诺',
      schoolId: 'school_001',
      sessionToken: tokenFor('openid_001', 'student_needs_review'),
    },
    now: new Date('2026-08-26T10:01:00.000Z'),
    repository,
    secret,
  })

  assert.equal(result.student.verificationStatus, 'pending')
})

test('returns submitted profile fields for the current student without WeChat internals', async () => {
  const repository = createMemoryRepository()

  const result = await getStudentProfileForEdit({
    input: {
      sessionToken: tokenFor('openid_001', 'student_001'),
    },
    now: new Date('2026-08-26T10:01:00.000Z'),
    repository,
    secret,
  })

  assert.deepEqual(result.profile, {
    birthday: '2007-09-01',
    classId: 'class_001',
    collegeId: 'college_001',
    gender: 'female',
    majorId: 'major_001',
    phone: '13800000001',
    realName: '林一诺',
    schoolId: 'school_001',
    verificationStatus: 'pending',
  })
  assert.equal('wechatOpenId' in result.profile, false)
  assert.equal('wechatUnionId' in result.profile, false)
})

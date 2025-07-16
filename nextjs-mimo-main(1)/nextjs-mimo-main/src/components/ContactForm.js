'use client'

import { useState } from 'react'

// Dictionnaire de traductions simple
const translations = {
  fr: {
    title: 'Contactez-nous',
    name: 'Nom',
    email: 'Email',
    subject: 'Sujet',
    message: 'Message',
    name_placeholder: 'Votre nom complet',
    email_placeholder: 'votre.email@exemple.com',
    subject_placeholder: 'Sujet de votre message',
    message_placeholder: 'Décrivez votre demande...',
    submit: 'Envoyer',
    submitting: 'Envoi en cours...',
    success: 'Votre message a été envoyé avec succès !',
    error: 'Une erreur est survenue. Veuillez réessayer.',
    name_required: 'Le nom est requis',
    email_required: "L'email est requis",
    email_invalid: "Format d'email invalide",
    subject_required: 'Le sujet est requis',
    message_required: 'Le message est requis',
    language: 'Langue',
    english: 'English',
    french: 'Français'
  },
  en: {
    title: 'Contact Us',
    name: 'Name',
    email: 'Email',
    subject: 'Subject',
    message: 'Message',
    name_placeholder: 'Your full name',
    email_placeholder: 'your.email@example.com',
    subject_placeholder: 'Subject of your message',
    message_placeholder: 'Describe your request...',
    submit: 'Send',
    submitting: 'Sending...',
    success: 'Your message has been sent successfully!',
    error: 'An error occurred. Please try again.',
    name_required: 'Name is required',
    email_required: 'Email is required',
    email_invalid: 'Invalid email format',
    subject_required: 'Subject is required',
    message_required: 'Message is required',
    language: 'Language',
    english: 'English',
    french: 'Français'
  }
}

export default function ContactForm () {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('') // 'success' or 'error'
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentLocale, setCurrentLocale] = useState('fr')

  // Fonction de traduction
  const t = (key, options = {}) => {
    return translations[currentLocale]?.[key] || options.defaultValue || key
  }

  // Fonction pour changer de langue
  const changeLanguage = newLocale => {
    setCurrentLocale(newLocale)
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.name.trim()) newErrors.name = t('name_required')

    if (!formData.email) {
      newErrors.email = t('email_required')
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('email_invalid')
    }

    if (!formData.subject.trim()) newErrors.subject = t('subject_required')
    if (!formData.message.trim()) newErrors.message = t('message_required')

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()

    if (!validate()) return

    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      })

      setStatus('success')
      setTimeout(() => setStatus(''), 5000)
    } catch (error) {
      console.error('Error submitting form:', error)
      setStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md'>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-2xl font-bold'>{t('title')}</h2>
        <div className='relative'>
          <label htmlFor='language-select' className='sr-only'>
            {t('language')}
          </label>
          <select
            id='language-select'
            value={currentLocale}
            onChange={e => changeLanguage(e.target.value)}
            className='block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md'
          >
            <option value='en'>{t('english')}</option>
            <option value='fr'>{t('french')}</option>
          </select>
        </div>
      </div>

      {status === 'success' && (
        <div className='mb-6 p-4 bg-green-100 text-green-700 rounded'>
          {t('success')}
        </div>
      )}

      {status === 'error' && (
        <div className='mb-6 p-4 bg-red-100 text-red-700 rounded'>
          {t('error')}
        </div>
      )}

      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <label
            htmlFor='name'
            className='block text-sm font-medium text-gray-700'
          >
            {t('name')} <span className='text-red-500'>*</span>
          </label>
          <input
            type='text'
            id='name'
            name='name'
            value={formData.name}
            onChange={handleChange}
            placeholder={t('name_placeholder')}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border ${
              errors.name ? 'border-red-500' : ''
            }`}
          />
          {errors.name && (
            <p className='mt-1 text-sm text-red-600'>{errors.name}</p>
          )}
        </div>

        <div>
          <label
            htmlFor='email'
            className='block text-sm font-medium text-gray-700'
          >
            {t('email')} <span className='text-red-500'>*</span>
          </label>
          <input
            type='email'
            id='email'
            name='email'
            value={formData.email}
            onChange={handleChange}
            placeholder={t('email_placeholder')}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border ${
              errors.email ? 'border-red-500' : ''
            }`}
          />
          {errors.email && (
            <p className='mt-1 text-sm text-red-600'>{errors.email}</p>
          )}
        </div>

        <div>
          <label
            htmlFor='subject'
            className='block text-sm font-medium text-gray-700'
          >
            {t('subject')} <span className='text-red-500'>*</span>
          </label>
          <input
            type='text'
            id='subject'
            name='subject'
            value={formData.subject}
            onChange={handleChange}
            placeholder={t('subject_placeholder')}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border ${
              errors.subject ? 'border-red-500' : ''
            }`}
          />
          {errors.subject && (
            <p className='mt-1 text-sm text-red-600'>{errors.subject}</p>
          )}
        </div>

        <div>
          <label
            htmlFor='message'
            className='block text-sm font-medium text-gray-700'
          >
            {t('message')} <span className='text-red-500'>*</span>
          </label>
          <textarea
            id='message'
            name='message'
            rows={4}
            value={formData.message}
            onChange={handleChange}
            placeholder={t('message_placeholder')}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border ${
              errors.message ? 'border-red-500' : ''
            }`}
          />
          {errors.message && (
            <p className='mt-1 text-sm text-red-600'>{errors.message}</p>
          )}
        </div>

        <div className='flex justify-end'>
          <button
            type='submit'
            disabled={isSubmitting}
            className='inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isSubmitting ? (
              <>
                <svg
                  className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                >
                  <circle
                    className='opacity-25'
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='4'
                  ></circle>
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                  ></path>
                </svg>
                {t('submitting', { defaultValue: 'Sending...' })}
              </>
            ) : (
              t('submit')
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

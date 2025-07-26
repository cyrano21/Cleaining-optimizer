"use client";
import React, { useState } from "react";
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'next-i18next';

export default function Login() {
  const { t } = useTranslation('login_modal');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const router = useRouter();

  const quickLogin = (role) => {
    const credentials = {
      admin: { email: 'admin@ecomus.com', password: 'admin123' },
      vendor: { email: 'vendor1@ecomus.com', password: 'vendor123' },
      client: { email: 'client@ecomus.com', password: 'client123' }
    };
    
    const cred = credentials[role];
    setEmail(cred.email);
    setPassword(cred.password);
    
    // Auto-submit après un court délai
    setTimeout(() => {
      handleSubmit({ preventDefault: () => {} });
    }, 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(t('error_incorrect_credentials') || 'Incorrect email or password');
      } else {
        // Fermer la modal
        const modal = document.getElementById('login');
        const bootstrapModal = window.bootstrap?.Modal?.getInstance(modal);
        if (bootstrapModal) {
          bootstrapModal.hide();
        }
        
        // Rediriger vers le dashboard
        router.push('/dashboard');
        
        // Réinitialiser le formulaire
        setEmail('');
        setPassword('');
        setError('');
      }
    } catch (error) {
      setError(t('error_generic') || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div
      className="modal modalCentered fade form-sign-in modal-part-content"
      id="login"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="header">
            <div className="demo-title">{t('title') || 'Ecomus Login'}</div>
            <span
              className="icon-close icon-close-popup"
              data-bs-dismiss="modal"
            />
          </div>
          <div className="tf-login-form">
            {/* Connexions rapides */}
            <div className="mb-3">
              <p className="small text-muted mb-2">{t('quick_login_title') || '🚀 Quick Login:'}</p>
              <div className="d-flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => quickLogin('admin')}
                  className="btn btn-sm btn-outline-primary flex-fill"
                  disabled={loading}
                  style={{ fontSize: '12px', padding: '6px 8px' }}
                >
                  {t('admin_button') || 'Admin'}
                </button>
                <button
                  type="button"
                  onClick={() => quickLogin('vendor')}
                  className="btn btn-sm btn-outline-success flex-fill"
                  disabled={loading}
                  style={{ fontSize: '12px', padding: '6px 8px' }}
                >
                  {t('vendor_button') || 'Vendor'}
                </button>
                <button
                  type="button"
                  onClick={() => quickLogin('client')}
                  className="btn btn-sm btn-outline-info flex-fill"
                  disabled={loading}
                  style={{ fontSize: '12px', padding: '6px 8px' }}
                >
                  {t('client_button') || 'Client'}
                </button>
              </div>
              <hr className="my-3" />
            </div>

            {/* Message d'erreur */}
            {error && (
              <div className="alert alert-danger d-flex align-items-center mb-3" role="alert">
                <i className="icon icon-warning me-2"></i>
                <span>{error}</span>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className=""
              acceptCharset="utf-8"
            >
              <div className="tf-field style-1">
                <input
                  className="tf-field-input tf-input"
                  placeholder=" "
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
                <label className="tf-field-label" htmlFor="">
                  {t('email_label') || 'Email'}
                </label>
              </div>
              <div className="tf-field style-1">
                <div className="password-field">
                  <input
                    className="tf-field-input tf-input"
                    placeholder=" "
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <label className="tf-field-label" htmlFor="">
                    {t('password_label') || 'Password'}
                  </label>
                  <button
                    type="button"
                    className="btn-show-pass"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <i className={`icon ${showPassword ? 'icon-eye-off' : 'icon-eye'}`}></i>
                  </button>
                </div>
              </div>
              <div>
                <a
                  href="#forgotPassword"
                  data-bs-toggle="modal"
                  className="btn-link link"
                >
                  {t('forgot_password_link') || 'Forgot your password?'}
                </a>
              </div>
              <div className="bottom">
                <div className="w-100">
                  <button
                    type="submit"
                    className="tf-btn btn-fill animate-hover-btn radius-3 w-100 justify-content-center"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        <span>{t('logging_in_button') || 'Logging in...'}</span>
                      </>
                    ) : (
                      <span>{t('login_button') || 'Login'}</span>
                    )}
                  </button>
                </div>
                <div className="w-100">
                  <a
                    href="#register"
                    data-bs-toggle="modal"
                    className="btn-link fw-6 w-100 link"
                  >
                    {t('register_link') || 'New customer? Create your account'}
                    <i className="icon icon-arrow1-top-left" />
                  </a>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

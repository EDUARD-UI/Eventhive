import { useState, useCallback } from 'react';

/**
 * Custom hook para manejo reactivo y validación de formularios.
 * @param {Object} initialValues - Valores iniciales del formulario.
 * @param {Function} validate - Función que retorna un objeto con errores de validación.
 */
export function useForm(initialValues = {}, validate = null) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const finalVal = type === 'checkbox' ? checked : value;

    setValues((prev) => ({
      ...prev,
      [name]: finalVal,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
    if (submitError) setSubmitError('');
  }, [errors, submitError]);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    if (validate) {
      const validationErrors = validate(values);
      setErrors(validationErrors || {});
    }
  }, [validate, values]);

  const setFieldValue = useCallback((name, value) => {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  }, [errors]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
    setSubmitError('');
  }, [initialValues]);

  const handleSubmit = useCallback((onSubmitCallback) => async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setSubmitError('');

    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    let currentErrors = {};
    if (validate) {
      currentErrors = validate(values) || {};
      setErrors(currentErrors);
    }

    if (Object.keys(currentErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmitCallback(values);
    } catch (err) {
      setSubmitError(err.message || 'Ocurrió un error al procesar el formulario.');
    } finally {
      setIsSubmitting(false);
    }
  }, [validate, values]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    submitError,
    setSubmitError,
    handleChange,
    handleBlur,
    setFieldValue,
    setValues,
    resetForm,
    handleSubmit,
  };
}

export default useForm;

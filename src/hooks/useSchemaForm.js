import { useForm } from 'react-hook-form';
export function useSchemaForm(schema, defaultValues) {
  const form = useForm({ defaultValues });
  const submit = action => form.handleSubmit(async values => {
    form.clearErrors(); const result = schema.safeParse(values);
    if (!result.success) {
      for (const issue of result.error.issues) form.setError(issue.path.join('.'), { type: 'validate', message: issue.message }, { shouldFocus: true });
      return;
    }
    await action(result.data);
  });
  return { ...form, submit };
}

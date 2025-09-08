"use client";
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { signup } from '@/lib/api';

export default function Signup() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const router = useRouter();

    const mutation = useMutation({
        mutationFn: signup,
        onSuccess: () => {
            alert('Signup successful! Please login.');
            router.push('/login');
        },
        onError: (error) => {
            alert('Error: ' + error.message);
        },
    });

    const onSubmit = (data) => {
        mutation.mutate(data);
    };

    return (
        <div className="container mx-auto p-4 max-w-md">
            <h1 className="text-2xl font-bold mb-4">Signup</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="block">Name</label>
                    <input
                        {...register('name', { required: 'Name is required' })}
                        className="border p-2 w-full"
                    />
                    {errors.name && <p className="text-red-500">{errors.name.message}</p>}
                </div>
                <div>
                    <label className="block">Email</label>
                    <input
                        type="email"
                        {...register('email', { required: 'Email is required' })}
                        className="border p-2 w-full"
                    />
                    {errors.email && <p className="text-red-500">{errors.email.message}</p>}
                </div>
                <div>
                    <label className="block">Password</label>
                    <input
                        type="password"
                        {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } })}
                        className="border p-2 w-full"
                    />
                    {errors.password && <p className="text-red-500">{errors.password.message}</p>}
                </div>
                <div>
                    <label className="block">Role</label>
                    <select
                        {...register('role', { required: 'Role is required' })}
                        className="border p-2 w-full"
                    >
                        <option value="Applicant">Applicant</option>
                        <option value="HR">HR</option>
                    </select>
                    {errors.role && <p className="text-red-500">{errors.role.message}</p>}
                </div>
                <button
                    type="submit"
                    disabled={mutation.isPending}
                    className="bg-blue-500 text-white p-2 rounded"
                >
                    {mutation.isPending ? 'Signing up...' : 'Signup'}
                </button>
            </form>
        </div>
    );
}
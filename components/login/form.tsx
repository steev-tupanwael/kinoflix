'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { auth } from '@/lib/firebase/firebase'
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { createSession } from '@/app/login/actions'
import { loginSchema, LoginValues } from "@/lib/validations"

// UI Components (Shadcn)
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "sonner"
import { RiEyeCloseLine, RiEyeLine, RiGoogleFill, RiLoader4Line } from '@remixicon/react'

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)

  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // 1. Inisialisasi RHF
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  // 2. Handler Login Email (Integrasi RHF)
  async function onSubmit(values: LoginValues) {
    startTransition(async () => {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password)
        const idToken = await userCredential.user.getIdToken()

        const result = await createSession(idToken)
        if (result.success) {
          toast.success("Login Berhasil!")
          router.push('/admin')
          router.refresh()
        }
      } catch (err: any) {
        toast.error("Gagal Login: Periksa Email/Password anda")
      }

    })
  }

  // 3. Handler Login Google
  async function handleGoogleLogin() {
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: 'select_account' })

    startTransition(async () => {
      try {
        const result = await signInWithPopup(auth, provider)
        const idToken = await result.user.getIdToken()

        const userData = {
          name: result.user.displayName || '',
          email: result.user.email || '',
          photo: result.user.photoURL || '',
        }

        const res = await createSession(idToken, userData)
        if (res.success) {
          toast.success("Login Google Berhasil!")
          router.push('/')
          router.refresh()
        }
      } catch (err: any) {
        toast.error("Gagal login dengan Google")
      }

    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background sm:bg-transparent p-4">
      {/* Container Responsif: Card muncul hanya di layar > 640px */}
      <div className="w-full max-w-100 space-y-6 sm:border sm:bg-card sm:p-8 sm:shadow-xl sm:rounded-2xl">

        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight uppercase">KINOFLIX</h1>
          <p className="text-sm text-muted-foreground">Masuk untuk mengelola sistem</p>
        </div>

        {/* Email Login Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="email@contoh.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  {/* 1. Wrapper harus relative agar tombol absolute patuh pada batas ini */}
                  <div className="relative flex items-center">
                    <FormControl>
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••"
                        className="pr-10"
                        {...field}
                      />
                    </FormControl>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? (
                        <RiEyeLine className="h-4 w-4" />
                      ) : (
                        <RiEyeCloseLine className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full font-bold" disabled={isPending}>
              {isPending ? (
                <>
                  <RiLoader4Line className='mr-2 h-4 w-4 animate-spin' />
                  Memproses...
                </>
              ) : (
                'Login dengan Email'
              )}
            </Button>
          </form>
        </Form>

        {/* Divider */}
        <div className="relative flex items-center py-1">
          <div className="grow border-t border-gray-200"></div>
          <span className="shrink mx-3 text-gray-400 text-[10px] uppercase font-bold">Atau</span>
          <div className="grow border-t border-gray-200"></div>
        </div>

        {/* Google Login */}
        <Button
          variant="secondary"
          onClick={handleGoogleLogin}
          disabled={isPending}
          className="w-full gap-2 group bg-blue-700! hover:bg-blue-500!">
          {isPending ? (
            <RiLoader4Line className='h-4 w-4 animate-spin' />
          )
            : (
              <RiGoogleFill className='h-6 w-6' />
            )
          }
          {isPending ? "Mohon Tunggu..." : "Login dengan Google"}
        </Button>

      </div>
    </div>
  )
}

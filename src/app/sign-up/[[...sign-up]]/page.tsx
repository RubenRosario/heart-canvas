import { SignUp } from '@clerk/nextjs'

export default function Page() {
  return (
    <section className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] px-4 py-10">
      <SignUp
        forceRedirectUrl="/"
        fallbackRedirectUrl="/"
        appearance={{
          elements: {
            card: 'rounded-2xl border border-slate-200 bg-white/90 shadow-xl shadow-slate-200/40 backdrop-blur-sm',
            headerTitle: 'text-3xl font-light tracking-tight text-slate-950',
            headerSubtitle: 'text-sm font-medium text-slate-700',
            socialButtonsBlockButton:
              'border-slate-200 bg-white text-slate-700 hover:bg-slate-100',
            formButtonPrimary:
              'bg-slate-950 text-white hover:bg-slate-800 rounded-full font-bold tracking-tight',
            formFieldInput:
              'border-slate-200 bg-slate-50/50 text-slate-950 placeholder:text-slate-500 focus:ring-slate-400',
            footerActionLink: 'text-slate-700 hover:text-slate-900',
          },
        }}
      />
    </section>
  )
}

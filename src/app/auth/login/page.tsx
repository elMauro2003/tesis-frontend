import { FormField } from "@/components/shared/FormField";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export default function Login() {
  return (
    <main className="flex min-h-screen w-full flex-col md:flex-row overflow-hidden bg-surface text-on-surface">
      {/* Left Column: Brand Section */}
      <section className="relative w-full md:w-1/2 bg-brand-gradient flex flex-col justify-between p-8 md:p-16 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 right-0 w-64 h-64 bg-primary-fixed rounded-full blur-3xl"></div>
        </div>
        {/* Brand Identity */}
        <div className="relative z-10">
          <div className="mb-12 inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 glass-effect">
            <span className="material-symbols-outlined text-white text-5xl">
              school
            </span>
          </div>
          <h1 className="font-headline text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-4">
            UCLV Residencias
          </h1>
          <p className="text-white/80 text-lg md:text-xl font-medium max-w-md leading-relaxed">
            Portal Inteligente de Gestión Académica y Residencial
          </p>
        </div>
        {/* Hero Image Integration */}
        <div className="relative z-10 w-full aspect-video md:aspect-auto md:h-64 rounded-2xl overflow-hidden my-12 group">
          <img
            alt="Campus Universitario"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC-xn_e2FN_422IOWmt7Rkrttm0o0JPr_RZc-venmHvTv6HudKTK7z5WYQKq2eP8TLVPDRXv0E-FlXSS2iNQ_0um1Mjx59Kyg2BGIzSM8Pl8axTqbwF7MPfBmiozB_RqWcPI5z75UDsXt2qoG4lSkgkfLYDTF8cdW1ynKhN3M9gk0UIWetl0_MQTEDtphyjAFNiza6TVVqRj2-slot30psEv50oye2PwA9bwALCcROzWtyY_Ad_rFuOvomgr8NIcRYWQPkIKnl8wg"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent"></div>
        </div>
        {/* Subtle Brand Footer */}
        <div className="relative z-10">
          <p className="text-white/60 text-sm font-medium tracking-wide">
            © 2026 Universidad Central &quot;Marta Abreu&quot; de Las Villas.
          </p>
        </div>
      </section>

      {/* Right Column: Login Form */}
      <section className="w-full md:w-1/2 bg-surface-container-lowest flex flex-col justify-center items-center p-8 md:p-20">
        <div className="w-full max-w-md">
          {/* Header Text */}
          <div className="mb-10 text-center md:text-left">
            <h2 className="font-headline text-3xl font-bold text-on-surface mb-3 tracking-tight">
              Iniciar Sesión
            </h2>
            <p className="text-on-surface-variant font-medium">
              Ingrese sus credenciales institucionales para acceder al sistema
            </p>
          </div>
          {/* Login Form */}
          <form className="space-y-6">
            {/* Username Field */}
            <FormField
              id="username"
              name="username"
              label="Usuario o Correo Institucional"
              icon="person"
              placeholder="ej. admin@uclv.cu"
              type="text"
            />

            {/* Password Field */}
            <FormField
              id="password"
              name="password"
              label="Contraseña"
              icon="lock"
              placeholder="••••••••"
              type="password"
              rightElement={
                <button
                  className="h-full px-2 flex items-center justify-center text-outline hover:text-on-surface transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 rounded"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[22px]">
                    visibility
                  </span>
                </button>
              }
            />

            {/* Form Options */}
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center space-x-3 group">
                <Checkbox
                  id="remember"
                  className="w-5 h-5 rounded-lg border-outline-variant text-primary data-[state=checked]:bg-primary data-[state=checked]:text-on-primary focus-visible:ring-primary/20 bg-surface-container-low transition-all data-[state=checked]:border-none shadow-none"
                />
                <label
                  htmlFor="remember"
                  className="text-sm font-semibold text-on-surface-variant group-hover:text-on-surface transition-colors cursor-pointer"
                >
                  Recordar sesión
                </label>
              </div>
              <a
                className="text-sm font-bold text-primary hover:text-primary-container transition-colors"
                href="#"
              >
                ¿Olvidó su contraseña?
              </a>
            </div>

            {/* Submit Button */}
            <Button
              type="button"
              className="w-full py-4 h-auto bg-primary text-white font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-primary-container shadow-none hover:shadow-xl hover:shadow-primary/10 active:scale-[0.98] transition-all duration-300"
            >
              <span>Acceder al Sistema</span>
              <span className="material-symbols-outlined">login</span>
            </Button>
          </form>
          {/* Access Notice */}
          <div className="mt-12 p-6 bg-surface-container-low rounded-2xl flex items-start gap-4">
            <div className="p-2 bg-surface-container-high rounded-xl text-primary">
              <span className="material-symbols-outlined">info</span>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-on-surface uppercase tracking-wider">
                Aviso de Seguridad
              </p>
              <p className="text-xs text-on-surface-variant font-medium leading-relaxed">
                El acceso a esta plataforma es exclusivo para estudiantes y
                personal autorizado. Si no posee credenciales, contacte a la{" "}
                <span className="text-primary font-bold">
                  Dirección de Residencia Estudiantil
                </span>
                .
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

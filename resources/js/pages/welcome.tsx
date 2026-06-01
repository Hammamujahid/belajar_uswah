import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { type SharedData } from '@/types';
import { LearningMaterial, Question, Subject } from '@/types/interfaces';
import { Link, usePage } from '@inertiajs/react';
import { Github, Instagram, Linkedin, Loader2, SquareArrowOutUpRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

function useScrollReveal() {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
            { threshold: 0.15 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return { ref, visible };
}

function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
    const { ref, visible } = useScrollReveal();
    return (
        <div
            ref={ref}
            className={className}
            style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(32px)',
                transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
            }}
        >
            {children}
        </div>
    );
}

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;
    const [subject, setSubject] = useState<Subject[]>([]);
    const [learningMaterial, setLearningMaterial] = useState<LearningMaterial[]>([]);
    const [question, setQuestion] = useState<Question[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [subjectResponse, learningMaterialResponse, questionResponse] = await Promise.all([
                fetch('/api/subjects'),
                fetch('/api/learning-materials'),
                fetch('/api/questions'),
            ]);
            if (!subjectResponse.ok || !learningMaterialResponse.ok || !questionResponse.ok) {
                throw new Error('Failed to fetch data');
            }
            const subjectResult = await subjectResponse.json();
            const learningMaterialResult = await learningMaterialResponse.json();
            const questionResult = await questionResponse.json();
            setSubject(subjectResult.data);
            setLearningMaterial(learningMaterialResult.data);
            setQuestion(questionResult.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full overflow-x-hidden">
            {/* NAVBAR */}
            <header className="sticky top-0 z-50 flex h-16 w-full items-center bg-background/70 px-4 shadow-sm backdrop-blur-md sm:h-20 sm:px-6 md:px-10">
                {auth.user ? (
                    <nav className="flex w-full items-center justify-end">
                        <Link
                            href={route('admin/dashboard')}
                            className="rounded-md border border-border px-4 py-1.5 text-sm transition hover:bg-muted"
                        >
                            Dashboard
                        </Link>
                    </nav>
                ) : (
                    <nav className="flex w-full items-center justify-between">
                        <div className="flex items-center gap-2">
                            <img src="/assets/logo.png" alt="Logo" width={48} height={48} className="sm:w-14" />
                            <span className="text-base font-semibold text-secondary sm:text-lg">Belajar Uswah</span>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-4">
                            <Link
                                href={route('login')}
                                className="rounded-lg px-3 py-1.5 text-sm text-primary transition hover:bg-secondary/50 hover:text-foreground"
                            >
                                Masuk
                            </Link>
                            <Link
                                href={route('register')}
                                className="rounded-lg bg-secondary px-4 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-secondary/90 active:scale-95"
                            >
                                Daftar
                            </Link>
                        </div>
                    </nav>
                )}
            </header>

            <main className="flex flex-col items-center gap-24 sm:gap-32 md:gap-40">
                {/* HERO */}
                <section className="flex w-full max-w-7xl flex-col items-center gap-6 px-4 pt-16 sm:px-8 md:flex-row md:items-center md:justify-between md:px-14 md:pt-24">
                    <div
                        className="flex w-full flex-col items-start gap-5 md:w-3/5"
                        style={{ animation: 'heroIn 0.8s ease both' }}
                    >
                        <h1 className="text-4xl font-bold leading-tight text-secondary sm:text-5xl md:text-6xl lg:text-7xl">
                            Belajar Lebih Terarah dan Praktis
                        </h1>
                        <p className="text-base text-muted-foreground sm:text-lg">
                            Akses materi pembelajaran yang terstruktur dan uji pemahamanmu dengan quiz yang bisa dikerjakan kapan saja.
                        </p>
                        <div className="flex flex-wrap gap-3 sm:gap-6">
                            <button className="rounded-2xl bg-secondary px-5 py-2.5 text-sm font-medium text-white shadow-md transition hover:opacity-90 hover:shadow-lg active:scale-95 sm:px-6 sm:py-3">
                                Mulai Belajar
                            </button>
                            <button className="rounded-2xl bg-primary-foreground px-5 py-2.5 text-sm font-medium text-secondary shadow-md transition hover:bg-secondary/10 active:scale-95 sm:px-6 sm:py-3">
                                Coba Quiz
                            </button>
                        </div>
                    </div>
                </section>

                {/* STATS */}
                <Reveal className="w-full max-w-7xl px-4 sm:px-8 md:px-14">
                    <div className="flex flex-col justify-center gap-4 rounded-2xl bg-secondary-foreground px-6 py-6 shadow-md sm:flex-row sm:gap-6 sm:px-8 sm:py-8">
                        {[
                            { count: learningMaterial?.length ?? 0, label: 'Materi Pembelajaran' },
                            { count: subject?.length ?? 0, label: 'Mata Pelajaran' },
                            { count: question?.length ?? 0, label: 'Quiz Interaktif' },
                        ].map((item, i) => (
                            <div
                                key={i}
                                className={`flex flex-1 flex-col items-center gap-1 ${i > 0 ? 'border-t border-muted-foreground/30 pt-4 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-6' : ''}`}
                            >
                                <span className="text-3xl font-bold text-muted sm:text-4xl">{item.count}</span>
                                <span className="font-mono text-xs text-primary-foreground sm:text-sm">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </Reveal>

                {/* MATERI SECTION */}
                <section className="flex w-full max-w-7xl flex-col gap-8 px-4 sm:px-8 md:flex-row md:items-center md:justify-between md:px-14">
                    <Reveal className="flex w-full flex-col gap-3 md:w-1/2" delay={0}>
                        <h2 className="text-2xl font-bold text-secondary sm:text-3xl">Materi yang Mudah Dipahami</h2>
                        <p className="text-sm text-muted-foreground sm:text-base">
                            Setiap materi disusun secara ringkas, jelas, dan terstruktur agar kamu bisa belajar dengan lebih efektif tanpa kebingungan.
                        </p>
                        <div className="mt-4">
                            <img src="/assets/section3_home.png" alt="section 3" className="w-full rounded-lg shadow-md sm:w-3/4" />
                        </div>
                    </Reveal>
                    <Reveal className="w-full md:w-2/5" delay={150}>
                        <Carousel opts={{ align: 'start', loop: true }} orientation="vertical" className="w-full">
                            <CarouselContent className="-mt-2 h-[360px] sm:h-[420px]">
                                {subject.map((item) => (
                                    <CarouselItem key={item.id} className="basis-1/3 pt-2">
                                        <Card className="h-full cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                                            <CardContent className="flex h-full flex-col justify-between px-4 py-3 sm:px-5 sm:py-4">
                                                <div className="flex items-start justify-between gap-3">
                                                    <h3 className="inline-block rounded-br-lg border-r-2 border-b-2 border-muted-foreground/40 pr-3 pb-2 text-base font-bold leading-tight text-secondary sm:text-xl">
                                                        {item.name}
                                                    </h3>
                                                    <div className="rounded-md bg-secondary p-1.5 sm:p-2">
                                                        <SquareArrowOutUpRight className="h-3.5 w-3.5 text-primary-foreground sm:h-4 sm:w-4" />
                                                    </div>
                                                </div>
                                                <p className="mt-2 line-clamp-3 text-xs text-muted-foreground sm:text-sm">
                                                    {item.description || 'Tidak ada deskripsi'}
                                                </p>
                                                <Link href={`/materi/${item.id}`} className="mt-3 inline-flex items-center justify-between text-xs font-medium text-primary hover:underline sm:text-sm" />
                                            </CardContent>
                                        </Card>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious className="text-secondary" />
                            <CarouselNext className="text-secondary" />
                        </Carousel>
                    </Reveal>
                </section>

                {/* QUIZ SECTION */}
                <Reveal className="w-full">
                    <section className="flex w-full flex-col items-center gap-8 bg-foreground px-4 py-16 sm:px-8 sm:py-20 md:flex-row md:justify-between md:px-14 md:py-28">
                        <div className="flex w-full justify-center md:w-1/2">
                            <img src="/assets/section4_home.png" alt="section 4" className="w-4/5 rounded-lg shadow-md sm:w-3/4" />
                        </div>
                        <div className="flex w-full flex-col items-start gap-3 md:w-1/2">
                            <h2 className="text-2xl font-bold text-secondary sm:text-3xl">Uji Pemahamanmu Kapan Saja</h2>
                            <p className="text-sm text-muted-foreground sm:text-base md:pr-16">
                                Kerjakan quiz kapan pun untuk mengukur sejauh mana kamu memahami materi. Tidak terikat waktu, belajar jadi lebih fleksibel.
                            </p>
                        </div>
                    </section>
                </Reveal>
            </main>

            {/* FOOTER */}
            <footer className="w-full bg-secondary-foreground py-6">
                <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-4 sm:flex-row sm:justify-between sm:px-6">
                    <p className="text-sm text-primary-foreground">© 2026 Belajar Uswah</p>
                    <div className="flex items-center gap-4">
                        <a href="#" className="text-muted-foreground transition hover:text-primary-foreground">
                            <Instagram className="h-5 w-5" />
                        </a>
                        <a href="#" className="text-muted-foreground transition hover:text-primary-foreground">
                            <Github className="h-5 w-5" />
                        </a>
                        <a href="#" className="text-muted-foreground transition hover:text-primary-foreground">
                            <Linkedin className="h-5 w-5" />
                        </a>
                    </div>
                </div>
            </footer>

            <style>{`
                @keyframes heroIn {
                    from { opacity: 0; transform: translateY(24px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}

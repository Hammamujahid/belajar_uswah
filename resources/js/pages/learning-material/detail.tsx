import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { api } from '@/lib/api';
import { BreadcrumbItem } from '@/types';
import { LearningMaterial } from '@/types/interfaces';
import { Head, Link, usePage } from '@inertiajs/react';
import { AxiosError } from 'axios';
import { BookOpen, FileText, Loader2, User } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import CreateQuestion from '../question/create';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Daftar Materi', href: '/admin/learning-material' },
    { title: 'Detail Materi', href: '' },
];

const DUMMY_FILE = 'uploads/dummy-materi.pdf';

function MetaBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
    return (
        <div className="flex items-center gap-1.5 rounded-lg bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground">
            {icon}
            <span>{label}</span>
        </div>
    );
}

function DocumentViewer({ filePath }: { filePath: string }) {
    const fixedUrl = filePath.replace('/image/upload/', '/raw/upload/');

    const ext = fixedUrl.split('?')[0].split('.').pop()?.toLowerCase();
    const fileUrl = fixedUrl;

    if (ext === 'pdf') {
        return <iframe src={fileUrl} className="h-[600px] w-full rounded-lg border border-border/20" title="Document Viewer" />;
    }

    if (['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(ext ?? '')) {
        return (
            <iframe
                src={`https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`}
                className="h-[600px] w-full rounded-lg border border-border/20"
                title="Document Viewer"
            />
        );
    }

    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext ?? '')) {
        return <img src={fileUrl} alt="Materi" className="w-full rounded-lg border border-border/20 object-contain" />;
    }

    return (
        <div className="flex h-48 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border/30 text-muted-foreground">
            <FileText className="h-10 w-10 opacity-40" />
            <p className="text-sm">Format tidak didukung untuk preview</p>
            <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md border border-border/30 px-3 py-1.5 text-xs transition hover:bg-muted"
            >
                Buka File
            </a>
        </div>
    );
}

export default function Detail() {
    const { id } = usePage<{ id: number }>().props;
    const [material, setMaterial] = useState<LearningMaterial | null>(null);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState('file');

    const fetchMaterial = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get(`/api/learning-materials/${id}`, {
                params: { subject: true },
            });
            setMaterial(response.data.data);
        } catch (err) {
            const error = err as AxiosError<{ message?: string }>;
            toast.error(error.response?.data?.message ?? 'Gagal memuat data');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchMaterial();
    }, [fetchMaterial]);

    if (loading || !material) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const filePath = material.file_path ?? DUMMY_FILE;
    const fileName = filePath.split('/').pop() ?? filePath;
    const fileExt = fileName.split('.').pop()?.toUpperCase() ?? 'FILE';

    const createdDate = material.created_at
        ? new Date(material.created_at).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
          })
        : '—';

    const extColorMap: Record<string, string> = {
        PDF: 'bg-red-100 text-red-700',
        DOCX: 'bg-blue-100 text-blue-700',
        DOC: 'bg-blue-100 text-blue-700',
        PPTX: 'bg-orange-100 text-orange-700',
        PPT: 'bg-orange-100 text-orange-700',
        XLSX: 'bg-green-100 text-green-700',
    };
    const extColor = extColorMap[fileExt] ?? 'bg-gray-100 text-gray-700';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Detail Learning Material" />

            <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 p-4">
                {/* Page header */}
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-medium text-primary">Detail Materi</h1>
                        <p className="text-sm text-muted-foreground">Informasi lengkap mengenai materi pembelajaran</p>
                    </div>
                    <Link href={`/learning-material/edit/${id}`}>
                        <button className="cursor-pointer rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-1.5 text-sm text-yellow-700 transition hover:bg-yellow-100">
                            Edit Materi
                        </button>
                    </Link>
                </div>

                {/* Hero card */}
                <div className="rounded-xl border border-muted-foreground/20 bg-background p-5 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-100">
                            <FileText className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div className="flex flex-1 flex-col gap-3">
                            <div>
                                <h2 className="text-lg font-medium text-primary">{material.name}</h2>
                                <p className="mt-1 text-sm text-muted-foreground">{createdDate}</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {material.subject?.name && <MetaBadge icon={<BookOpen className="h-3.5 w-3.5" />} label={material.subject.name} />}
                                <MetaBadge icon={<User className="h-3.5 w-3.5" />} label={material.created_by} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Deskripsi */}
                <div className="rounded-xl border border-muted-foreground/20 bg-background p-5 shadow-sm">
                    <p className="mb-3 text-xs font-medium tracking-widest text-muted-foreground/60 uppercase">Deskripsi</p>
                    <p className="text-sm leading-relaxed text-primary/80">
                        {material.description || <span className="text-muted-foreground italic">Tidak ada deskripsi.</span>}
                    </p>
                </div>

                <Tabs value={value} onValueChange={setValue}>
                    <div className='flex justify-between items-center'>
                        <TabsList>
                            <TabsTrigger value="file">File Materi</TabsTrigger>
                            <TabsTrigger value="questions">Soal</TabsTrigger>
                        </TabsList>
                        {value === 'questions' ? (
                            <Dialog open={open} onOpenChange={setOpen}>
                                <DialogTrigger asChild>
                                    <button className="mr-8 cursor-pointer rounded-lg bg-green-600 px-4 py-2 font-medium text-foreground shadow-md transition hover:font-normal hover:shadow-transparent">
                                        + Tambah Soal
                                    </button>
                                </DialogTrigger>

                                <DialogContent className="flex max-h-[80vh] flex-col">
                                    <DialogHeader>
                                        <DialogTitle>Tambah Soal</DialogTitle>
                                    </DialogHeader>

                                    <div className="flex-1 overflow-y-auto px-4">
                                        <CreateQuestion
                                    onSuccess={() => {
                                        setOpen(false);
                                    }}
                                />
                                    </div>
                                </DialogContent>
                            </Dialog>
                        ) : null}
                    </div>
                    <TabsContent value="file">
                        {/* File viewer */}
                        <div className="rounded-xl border border-muted-foreground/20 bg-background p-5 shadow-sm">
                            <div className="mb-4 flex items-center justify-between">
                                <p className="text-xs font-medium tracking-widest text-muted-foreground/60 uppercase">File Materi</p>
                                <div className="flex items-center gap-2">
                                    <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${extColor}`}>{fileExt}</span>
                                    <span className="max-w-[200px] truncate text-xs text-muted-foreground">{fileName}</span>
                                    <a
                                        href={filePath}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="rounded-md border border-border/30 px-2.5 py-1 text-xs transition hover:bg-muted"
                                    >
                                        Buka
                                    </a>
                                </div>
                            </div>

                            <DocumentViewer filePath={filePath} />

                            {!material.file_path && (
                                <p className="mt-2 text-center text-xs text-muted-foreground/50 italic">
                                    * Menampilkan file dummy — belum ada file yang diupload
                                </p>
                            )}
                        </div>
                    </TabsContent>
                    <TabsContent value="questions">Soal</TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}

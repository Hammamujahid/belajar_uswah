
export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md  text-sidebar-primary-foreground">
                <img src="/assets/logo.png" alt="Logo" className="size-8" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm text-primary">
                <span className="mb-0.5 truncate leading-tight font-semibold">Belajar Uswah</span>
            </div>
        </>
    );
}

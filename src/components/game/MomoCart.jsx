import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const MomoCart = () => {
    // A simple placeholder style for the cart image.
    const cartStyle = {
        backgroundImage: "url('https://placehold.co/600x400/F5F5F5/333333?text=Momo+Cart')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    };

    return (
        <Card className="border-2 border-gray-200 shadow-lg h-full">
            <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-800 text-center">Your Humble Momo Stall</CardTitle>
            </CardHeader>
            <CardContent>
                <div style={cartStyle} className="w-full h-64 md:h-80 rounded-lg shadow-inner flex items-center justify-center">
                    <div className="text-white text-2xl font-bold bg-black bg-opacity-50 px-4 py-2 rounded-md">
                        🥟 Fresh Momos! 🥟
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

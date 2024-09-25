import React from 'react';

interface GenerateEtagProps{
    params:{
        id: string
    }
}

function GenerateEtagById({ params }: GenerateEtagProps) {
    return (
        <div>
            This is Generate Etag: {params.id}
        </div>
    );
}

export default GenerateEtagById;